import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quotationAPI } from '../../services/quotationService';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const SubmitQuotation = () => {
    const { token, tenderId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingExcel, setUploadingExcel] = useState(false);
    const [tender, setTender] = useState(null);
    const [items, setItems] = useState([]);
    const [quotation, setQuotation] = useState(null);

    const [selectedItems, setSelectedItems] = useState({}); // Track which items seller can supply

    const [formData, setFormData] = useState({
        delivery_period: '',
        remarks: '',
        status: 'draft',
    });

    const [itemPrices, setItemPrices] = useState({});

    useEffect(() => {
        fetchQuotationData();
    }, [token, tenderId]);

    const fetchQuotationData = async () => {
        try {
            setLoading(true);
            const response = await quotationAPI.getMyQuotation(token, tenderId);

            setTender(response.data.tender);
            setItems(response.data.items);

            if (response.data.quotation) {
                setQuotation(response.data.quotation);
                setFormData({
                    delivery_period: response.data.quotation.delivery_period || '',
                    remarks: response.data.quotation.remarks || '',
                    status: response.data.quotation.status || 'draft',
                });

                // Populate item prices from existing quotation
                const pricesMap = {};
                const selectedMap = {};
                response.data.items.forEach(item => {
                    const hasPrice = item.unit_price !== null && item.unit_price !== undefined;
                    const key = item.tender_item_id || item.id;
                    pricesMap[key] = {
                        unit_price: item.unit_price || '',
                        discount_percent: item.discount_percent || 0,
                        alternative_brand: item.alternative_brand || '',
                        alternative_origin: item.alternative_origin || '',
                        remarks: item.remarks || '',
                    };
                    const isFullyAvailable = true;
                    selectedMap[key] = isFullyAvailable && hasPrice;
                });
                setItemPrices(pricesMap);
                setSelectedItems(selectedMap);
            } else {
                // Initialize empty prices for new quotation
                const pricesMap = {};
                const selectedMap = {};
                response.data.items.forEach(item => {
                    const key = item.id;
                    pricesMap[key] = {
                        unit_price: '',
                        discount_percent: 0,
                        alternative_brand: '',
                        alternative_origin: '',
                        remarks: '',
                    };
                    const isFullyAvailable = true;
                    selectedMap[key] = isFullyAvailable;
                });
                setItemPrices(pricesMap);
                setSelectedItems(selectedMap);
            }
        } catch (error) {
            console.error('Error fetching quotation:', error);
            const msg = error.message || 'Failed to load quotation details';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // EXCEL WORKFLOW FUNCTIONS
    // ============================================

    const downloadExcelTemplate = () => {
        try {
            // Prepare data for Excel template
            const excelData = items.map((item, index) => ({
                '#': index + 1,
                'Item ID (DO NOT EDIT)': item.id,
                'Item Name': item.item_name,
                'Brand': item.brand || '-',
                'Quantity': item.qty,
                'Unit': item.unit || 'pcs',
                'Unit Price *': itemPrices[item.id]?.unit_price || '',
                'Discount %': itemPrices[item.id]?.discount_percent || 0,
                'Alternative Brand': itemPrices[item.id]?.alternative_brand || '',
                'Remarks': itemPrices[item.id]?.remarks || '',
            }));

            // Create workbook
            const ws = XLSX.utils.json_to_sheet(excelData);

            // Set column widths
            ws['!cols'] = [
                { wch: 5 },   // #
                { wch: 20 },  // Item ID
                { wch: 30 },  // Item Name
                { wch: 15 },  // Brand
                { wch: 10 },  // Quantity
                { wch: 10 },  // Unit
                { wch: 15 },  // Unit Price
                { wch: 12 },  // Discount %
                { wch: 20 },  // Alt Brand
                { wch: 30 },  // Remarks
            ];

            // Protect Item ID column (make it read-only visually)
            // Note: True protection requires Excel features, this is visual guidance

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Quotation Items');

            // Add instructions sheet
            const instructions = [
                ['INSTRUCTIONS FOR FILLING THE QUOTATION'],
                [''],
                ['1. DO NOT modify the "Item ID" column - it is used to match items'],
                ['2. Fill in "Unit Price" for each item you can supply'],
                ['3. Optionally add "Discount %" (0-100)'],
                ['4. You can specify an "Alternative Brand" if needed'],
                ['5. Add any "Remarks" for specific items'],
                ['6. Save the file and upload it back to the system'],
                [''],
                ['IMPORTANT:'],
                ['- Unit Price must be greater than 0'],
                ['- Discount % must be between 0 and 100'],
                ['- Do not add or remove rows'],
                ['- Do not change column headers'],
            ];
            const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
            wsInstructions['!cols'] = [{ wch: 70 }];
            XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

            // Download file
            const fileName = `Quotation_${tender?.tender_title || 'Template'}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);

            toast.success('Excel template downloaded successfully');
        } catch (error) {
            console.error('Error generating Excel template:', error);
            toast.error('Failed to generate Excel template');
        }
    };

    const handleExcelUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadingExcel(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Read the first sheet
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Process and validate data
                const updatedPrices = { ...itemPrices };
                const updatedSelection = { ...selectedItems };
                let hasErrors = false;
                let processedCount = 0;

                jsonData.forEach((row) => {
                    const itemId = row['Item ID (DO NOT EDIT)'];
                    const unitPrice = parseFloat(row['Unit Price *']) || 0;
                    const discountPercent = parseFloat(row['Discount %']) || 0;
                    const alternativeBrand = row['Alternative Brand'] || '';
                    const remarks = row['Remarks'] || '';

                    // Find matching item
                    const matchingItem = items.find(item => item.id === itemId);

                    if (!matchingItem) {
                        console.warn(`Item ID ${itemId} not found in tender items`);
                        return;
                    }

                    // Validate
                    if (unitPrice < 0) {
                        toast.error(`Invalid price for "${matchingItem.item_name}"`);
                        hasErrors = true;
                        return;
                    }

                    if (discountPercent < 0 || discountPercent > 100) {
                        toast.error(`Invalid discount for "${matchingItem.item_name}" (must be 0-100)`);
                        hasErrors = true;
                        return;
                    }

                    // Update prices
                    updatedPrices[itemId] = {
                        unit_price: unitPrice > 0 ? unitPrice : '',
                        discount_percent: discountPercent,
                        alternative_brand: alternativeBrand,
                        alternative_origin: updatedPrices[itemId]?.alternative_origin || '',
                        remarks: remarks,
                    };

                    // Auto-select items with valid prices
                    if (unitPrice > 0) {
                        updatedSelection[itemId] = true;
                        processedCount++;
                    }
                });

                if (!hasErrors) {
                    setItemPrices(updatedPrices);
                    setSelectedItems(updatedSelection);
                    toast.success(`Excel uploaded successfully! ${processedCount} items processed.`);
                } else {
                    toast.error('Excel upload completed with errors. Please check the data.');
                }

            } catch (error) {
                console.error('Error processing Excel file:', error);
                toast.error('Failed to process Excel file. Please check the format.');
            } finally {
                setUploadingExcel(false);
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };

        reader.onerror = () => {
            toast.error('Failed to read Excel file');
            setUploadingExcel(false);
        };

        reader.readAsArrayBuffer(file);
    };

    // ============================================
    // EXISTING FUNCTIONS
    // ============================================

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemSelection = (itemId, isSelected) => {
        setSelectedItems(prev => ({
            ...prev,
            [itemId]: isSelected,
        }));
    };

    const handleItemPriceChange = (itemId, field, value) => {
        setItemPrices(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [field]: value,
            },
        }));
    };

    const calculateFinalPrice = (unitPrice, discountPercent) => {
        const price = parseFloat(unitPrice) || 0;
        const discount = parseFloat(discountPercent) || 0;
        return price - (price * discount / 100);
    };

    const validateForm = () => {
        const hasSelectedItems = Object.values(selectedItems).some(selected => selected);
        if (!hasSelectedItems) {
            toast.error('Please select at least one item you can supply');
            return false;
        }

        for (const item of items) {
            const key = item.tender_item_id || item.id;
            if (selectedItems[key] && (!itemPrices[key]?.unit_price || parseFloat(itemPrices[key].unit_price) <= 0)) {
                toast.error(`Please enter a valid unit price for "${item.item_name}"`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (isDraft = false) => {
        if (!isDraft && !validateForm()) {
            return;
        }

        try {
            setSubmitting(true);

            const quotationData = {
                invitation_token: token || null,
                tender_id: tenderId || (tender ? tender.id : null),
                delivery_period: formData.delivery_period,
                remarks: formData.remarks,
                status: isDraft ? 'draft' : 'submitted',
                items: items
                    .filter(item => selectedItems[item.tender_item_id || item.id])
                    .map(item => {
                        const key = item.tender_item_id || item.id;
                        return {
                            tender_item_id: key,
                            unit_price: parseFloat(itemPrices[key]?.unit_price) || 0,
                            discount_percent: parseFloat(itemPrices[key]?.discount_percent) || 0,
                            alternative_brand: itemPrices[key]?.alternative_brand || null,
                            alternative_origin: itemPrices[key]?.alternative_origin || null,
                            remarks: itemPrices[key]?.remarks || null,
                        };
                    }),
            };

            await quotationAPI.submitQuotation(quotationData);

            toast.success(isDraft ? 'Quotation saved as draft' : 'Quotation submitted successfully');

            if (!isDraft) {
                navigate('/seller/invited-quotations');
            } else {
                fetchQuotationData();
            }
        } catch (error) {
            console.error('Error submitting quotation:', error);
            toast.error(error.message || 'Failed to submit quotation');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!tender) {
        return (
            <div className="alert alert-danger" role="alert">
                Invalid or expired invitation link.
            </div>
        );
    }

    const isReadOnly = quotation?.status === 'submitted';

    return (
        <div className="row">
            <div className="col-12">
                <div className="card mb-4">
                    <div className="card-header">
                        <strong>Submit Quotation</strong>
                        {quotation && (
                            <span className={`badge bg-${quotation.status === 'submitted' ? 'success' : 'warning'} ms-2`}>
                                {quotation.status.toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="card-body">
                        {/* Tender Information */}
                        <div className="mb-4">
                            <h5>{tender.tender_title || tender.title}</h5>
                            <p className="text-muted">{tender.tender_description || tender.description}</p>
                            {tender.required_documents && (
                                <div className="alert alert-info">
                                    <strong>Required Documents:</strong>
                                    <p className="mb-0">{tender.required_documents}</p>
                                </div>
                            )}
                        </div>

                        {/* ============================================ */}
                        {/* EXCEL WORKFLOW SECTION - ANTI-GRAVITY */}
                        {/* ============================================ */}
                        {!isReadOnly && (
                            <div className="card mb-4 border-primary">
                                <div className="card-header bg-primary bg-opacity-10">
                                    <strong className="text-primary">📊 Excel-Based Pricing Workflow</strong>
                                </div>
                                <div className="card-body">
                                    <p className="mb-3">
                                        <strong>Choose your preferred method:</strong> You can either fill prices manually in the table below,
                                        or use Excel for faster bulk pricing.
                                    </p>
                                    <div className="d-flex gap-3 flex-wrap">
                                        <button
                                            className="btn btn-success"
                                            onClick={downloadExcelTemplate}
                                            disabled={items.length === 0}
                                        >
                                            <span className="me-2">📥</span>
                                            Download Excel Template
                                        </button>
                                        <div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".xlsx,.xls"
                                                onChange={handleExcelUpload}
                                                style={{ display: 'none' }}
                                                id="excel-upload"
                                            />
                                            <label htmlFor="excel-upload" className="btn btn-primary mb-0">
                                                {uploadingExcel ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="me-2">📤</span>
                                                        Upload Completed Excel
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="alert alert-warning mt-3 mb-0">
                                        <small>
                                            <strong>Note:</strong> Excel upload will auto-fill the pricing fields below.
                                            You can still manually edit any field after upload.
                                        </small>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Items Table */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">Select Items You Can Supply</h6>
                            <small className="text-muted text-end">Only items available in your stock can be quoted.</small>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th className="text-center">Can Supply?</th>
                                        <th>Status</th>
                                        <th>Item Name</th>
                                        <th>Brand</th>
                                        <th>Qty</th>
                                        <th>Unit Price *</th>
                                        <th>Discount %</th>
                                        <th>Final Price</th>
                                        <th>Alt. Brand</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => {
                                        const key = item.tender_item_id || item.id;
                                        return (
                                            <tr
                                                key={key}
                                                className={`${!selectedItems[key] ? 'table-secondary opacity-75' :
                                                    item.is_accepted ? 'table-success bg-opacity-10' : ''
                                                    }`}
                                            >
                                                <td>{index + 1}</td>
                                                <td className="text-center">
                                                    {item.is_available ? (
                                                        item.available_qty >= item.qty ? (
                                                            <div className="form-check d-flex justify-content-center">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    checked={selectedItems[key] || false}
                                                                    onChange={(e) => handleItemSelection(key, e.target.checked)}
                                                                    disabled={isReadOnly}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span className="badge bg-warning text-dark" title={`Available: ${item.available_qty}`}>
                                                                Insufficient Stock
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="badge bg-danger">Not Available</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {item.is_accepted ? (
                                                        <span className="badge bg-success">
                                                            <span className="me-1">✔️</span>
                                                            Accepted
                                                        </span>
                                                    ) : item.selection_id ? (
                                                        <span className="badge bg-secondary">Not Selected</span>
                                                    ) : (
                                                        <span className="badge bg-info text-dark">Pending</span>
                                                    )}
                                                </td>
                                                <td>{item.item_name}</td>
                                                <td>{item.brand || '-'}</td>
                                                <td>{item.qty}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        step="0.01"
                                                        min="0"
                                                        value={itemPrices[key]?.unit_price || ''}
                                                        onChange={(e) => handleItemPriceChange(key, 'unit_price', e.target.value)}
                                                        disabled={!selectedItems[key] || isReadOnly}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        value={itemPrices[key]?.discount_percent || 0}
                                                        onChange={(e) => handleItemPriceChange(key, 'discount_percent', e.target.value)}
                                                        disabled={!selectedItems[key] || isReadOnly}
                                                    />
                                                </td>
                                                <td>
                                                    <strong>
                                                        {calculateFinalPrice(
                                                            itemPrices[key]?.unit_price,
                                                            itemPrices[key]?.discount_percent
                                                        ).toFixed(2)}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={itemPrices[key]?.alternative_brand || ''}
                                                        onChange={(e) => handleItemPriceChange(key, 'alternative_brand', e.target.value)}
                                                        placeholder="Optional"
                                                        disabled={!selectedItems[key] || isReadOnly}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={itemPrices[key]?.remarks || ''}
                                                        onChange={(e) => handleItemPriceChange(key, 'remarks', e.target.value)}
                                                        placeholder="Optional"
                                                        disabled={!selectedItems[key] || isReadOnly}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Additional Information */}
                        <div className="row mt-4">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label">Delivery Period</label>
                                    <input
                                        type="text"
                                        name="delivery_period"
                                        className="form-control"
                                        value={formData.delivery_period}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 30 days"
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">General Remarks</label>
                            <textarea
                                name="remarks"
                                className="form-control"
                                rows={3}
                                value={formData.remarks}
                                onChange={handleInputChange}
                                placeholder="Any additional information..."
                                disabled={isReadOnly}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-primary"
                                onClick={() => handleSubmit(false)}
                                disabled={submitting || isReadOnly}
                            >
                                {submitting ? <div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Loading...</span></div> : 'Submit Quotation'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => handleSubmit(true)}
                                disabled={submitting || isReadOnly}
                            >
                                Save as Draft
                            </button>
                            <button
                                className="btn btn-light"
                                onClick={() => navigate('/seller/invited-quotations')}
                            >
                                {isReadOnly ? 'Back' : 'Cancel'}
                            </button>
                        </div>

                        {isReadOnly && (
                            <div className="alert alert-info mt-3" role="alert">
                                <strong>Read-Only:</strong> This quotation has been submitted and cannot be edited.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmitQuotation;
