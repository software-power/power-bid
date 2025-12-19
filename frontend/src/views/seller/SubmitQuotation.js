import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CForm,
    CFormInput,
    CFormTextarea,
    CFormLabel,
    CFormCheck,
    CButton,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CSpinner,
    CAlert,
    CBadge,
} from '@coreui/react';
import { quotationAPI } from '../../services/quotationService';
import { toast } from 'react-toastify';
import CIcon from '@coreui/icons-react';
import { cilCheckCircle } from '@coreui/icons';

const SubmitQuotation = () => {
    const { token, tenderId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
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
                    // Stock validation disabled per user request
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
                    // Stock validation disabled per user request
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
        // Check if at least one item is selected
        const hasSelectedItems = Object.values(selectedItems).some(selected => selected);
        if (!hasSelectedItems) {
            toast.error('Please select at least one item you can supply');
            return false;
        }

        // Check if all selected items have unit prices
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
                    .filter(item => selectedItems[item.tender_item_id || item.id]) // Only include selected items
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
                fetchQuotationData(); // Reload to get updated quotation ID
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
                <CSpinner color="primary" />
            </div>
        );
    }

    if (!tender) {
        return (
            <CAlert color="danger">
                Invalid or expired invitation link.
            </CAlert>
        );
    }

    const isReadOnly = quotation?.status === 'submitted';

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Submit Quotation</strong>
                        {quotation && (
                            <CBadge color={quotation.status === 'submitted' ? 'success' : 'warning'} className="ms-2">
                                {quotation.status.toUpperCase()}
                            </CBadge>
                        )}
                    </CCardHeader>
                    <CCardBody>
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

                        {/* Items Table */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">Select Items You Can Supply</h6>
                            <small className="text-muted text-end">Only items available in your stock can be quoted.</small>
                        </div>
                        <CTable bordered responsive>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>#</CTableHeaderCell>
                                    <CTableHeaderCell className="text-center">Can Supply?</CTableHeaderCell>
                                    <CTableHeaderCell>Status</CTableHeaderCell>
                                    <CTableHeaderCell>Item Name</CTableHeaderCell>
                                    <CTableHeaderCell>Brand</CTableHeaderCell>
                                    <CTableHeaderCell>Qty</CTableHeaderCell>
                                    <CTableHeaderCell>Unit Price *</CTableHeaderCell>
                                    <CTableHeaderCell>Discount %</CTableHeaderCell>
                                    <CTableHeaderCell>Final Price</CTableHeaderCell>
                                    <CTableHeaderCell>Alt. Brand</CTableHeaderCell>
                                    <CTableHeaderCell>Remarks</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {items.map((item, index) => {
                                    const key = item.tender_item_id || item.id;
                                    return (
                                        <CTableRow
                                            key={key}
                                            className={`${!selectedItems[key] ? 'table-secondary opacity-75' :
                                                item.is_accepted ? 'table-success bg-opacity-10' : ''
                                                }`}
                                        >
                                            <CTableDataCell>{index + 1}</CTableDataCell>
                                            <CTableDataCell className="text-center">
                                                {item.is_available ? (
                                                    item.available_qty >= item.qty ? (
                                                        <CFormCheck
                                                            checked={selectedItems[key] || false}
                                                            onChange={(e) => handleItemSelection(key, e.target.checked)}
                                                            disabled={isReadOnly}
                                                        />
                                                    ) : (
                                                        <CBadge color="warning" title={`Available: ${item.available_qty}`}>
                                                            Insufficient Stock
                                                        </CBadge>
                                                    )
                                                ) : (
                                                    <CBadge color="danger">Not Available</CBadge>
                                                )}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                {item.is_accepted ? (
                                                    <CBadge color="success">
                                                        <CIcon icon={cilCheckCircle} className="me-1" size="sm" />
                                                        Accepted
                                                    </CBadge>
                                                ) : item.selection_id ? (
                                                    <CBadge color="secondary">Not Selected</CBadge>
                                                ) : (
                                                    <CBadge color="info">Pending</CBadge>
                                                )}
                                            </CTableDataCell>
                                            <CTableDataCell>{item.item_name}</CTableDataCell>
                                            <CTableDataCell>{item.brand || '-'}</CTableDataCell>
                                            <CTableDataCell>{item.qty}</CTableDataCell>
                                            <CTableDataCell>
                                                <CFormInput
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={itemPrices[key]?.unit_price || ''}
                                                    onChange={(e) => handleItemPriceChange(key, 'unit_price', e.target.value)}
                                                    disabled={!selectedItems[key] || isReadOnly}
                                                    required
                                                />
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CFormInput
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    value={itemPrices[key]?.discount_percent || 0}
                                                    onChange={(e) => handleItemPriceChange(key, 'discount_percent', e.target.value)}
                                                    disabled={!selectedItems[key] || isReadOnly}
                                                />
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <strong>
                                                    {calculateFinalPrice(
                                                        itemPrices[key]?.unit_price,
                                                        itemPrices[key]?.discount_percent
                                                    ).toFixed(2)}
                                                </strong>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CFormInput
                                                    type="text"
                                                    value={itemPrices[key]?.alternative_brand || ''}
                                                    onChange={(e) => handleItemPriceChange(key, 'alternative_brand', e.target.value)}
                                                    placeholder="Optional"
                                                    disabled={!selectedItems[key] || isReadOnly}
                                                />
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CFormInput
                                                    type="text"
                                                    value={itemPrices[key]?.remarks || ''}
                                                    onChange={(e) => handleItemPriceChange(key, 'remarks', e.target.value)}
                                                    placeholder="Optional"
                                                    disabled={!selectedItems[key] || isReadOnly}
                                                />
                                            </CTableDataCell>
                                        </CTableRow>
                                    );
                                })}
                            </CTableBody>
                        </CTable>

                        {/* Additional Information */}
                        <CRow className="mt-4">
                            <CCol md={6}>
                                <div className="mb-3">
                                    <CFormLabel>Delivery Period</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        name="delivery_period"
                                        value={formData.delivery_period}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 30 days"
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </CCol>
                        </CRow>

                        <div className="mb-3">
                            <CFormLabel>General Remarks</CFormLabel>
                            <CFormTextarea
                                name="remarks"
                                rows={3}
                                value={formData.remarks}
                                onChange={handleInputChange}
                                placeholder="Any additional information..."
                                disabled={isReadOnly}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex gap-2">
                            <CButton
                                color="primary"
                                onClick={() => handleSubmit(false)}
                                disabled={submitting || isReadOnly}
                            >
                                {submitting ? <CSpinner size="sm" /> : 'Submit Quotation'}
                            </CButton>
                            <CButton
                                color="secondary"
                                onClick={() => handleSubmit(true)}
                                disabled={submitting || isReadOnly}
                            >
                                Save as Draft
                            </CButton>
                            <CButton
                                color="light"
                                onClick={() => navigate('/seller/invited-quotations')}
                            >
                                {isReadOnly ? 'Back' : 'Cancel'}
                            </CButton>
                        </div>

                        {isReadOnly && (
                            <CAlert color="info" className="mt-3">
                                <strong>Read-Only:</strong> This quotation has been submitted and cannot be edited.
                            </CAlert>
                        )}
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default SubmitQuotation;
