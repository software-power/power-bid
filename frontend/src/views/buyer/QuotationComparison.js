import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CButton,
    CSpinner,
    CAlert,
    CBadge,
} from '@coreui/react';
import { quotationAPI } from '../../services/quotationService';
import { toast } from 'react-toastify';
import CIcon from '@coreui/icons-react';
import { cilCheckCircle } from '@coreui/icons';

const QuotationComparison = () => {
    const { tenderId } = useParams();

    const [loading, setLoading] = useState(true);
    const [comparison, setComparison] = useState([]);
    const [selecting, setSelecting] = useState({});

    useEffect(() => {
        fetchComparison();
    }, [tenderId]);

    const fetchComparison = async () => {
        try {
            setLoading(true);
            const response = await quotationAPI.getTenderComparison(tenderId);
            setComparison(response.data || []);
        } catch (error) {
            console.error('Error fetching comparison:', error);
            toast.error('Failed to load comparison data');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSupplier = async (itemId, quotationId) => {
        try {
            setSelecting(prev => ({ ...prev, [itemId]: true }));

            await quotationAPI.selectSupplier({
                tender_id: parseInt(tenderId),
                item_id: itemId,
                quotation_id: quotationId,
            });

            toast.success('Supplier selected successfully');
            fetchComparison(); // Reload to show updated selection
        } catch (error) {
            console.error('Error selecting supplier:', error);
            toast.error('Failed to select supplier');
        } finally {
            setSelecting(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const getLowestPrice = (suppliers) => {
        if (!suppliers || suppliers.length === 0) return null;
        return Math.min(...suppliers.map(s => parseFloat(s.final_price)));
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <CSpinner color="primary" />
            </div>
        );
    }

    if (comparison.length === 0) {
        return (
            <CAlert color="info">
                No quotations have been submitted yet.
            </CAlert>
        );
    }

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Quotation Comparison</strong>
                        <CBadge color="info" className="ms-2">
                            {comparison.length} Items
                        </CBadge>
                    </CCardHeader>
                    <CCardBody>
                        <div className="table-responsive">
                            <CTable bordered hover>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell rowSpan={2} className="align-middle">#</CTableHeaderCell>
                                        <CTableHeaderCell rowSpan={2} className="align-middle">Item Name</CTableHeaderCell>
                                        <CTableHeaderCell rowSpan={2} className="align-middle">Brand</CTableHeaderCell>
                                        <CTableHeaderCell rowSpan={2} className="align-middle">Qty</CTableHeaderCell>
                                        <CTableHeaderCell rowSpan={2} className="align-middle">UoM</CTableHeaderCell>
                                        <CTableHeaderCell colSpan={5} className="text-center bg-light">
                                            Top 5 Suppliers (Lowest Price First)
                                        </CTableHeaderCell>
                                    </CTableRow>
                                    <CTableRow>
                                        <CTableHeaderCell className="text-center bg-light">1st</CTableHeaderCell>
                                        <CTableHeaderCell className="text-center bg-light">2nd</CTableHeaderCell>
                                        <CTableHeaderCell className="text-center bg-light">3rd</CTableHeaderCell>
                                        <CTableHeaderCell className="text-center bg-light">4th</CTableHeaderCell>
                                        <CTableHeaderCell className="text-center bg-light">5th</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {comparison.map((itemData, index) => {
                                        const lowestPrice = getLowestPrice(itemData.suppliers);
                                        const suppliers = itemData.suppliers || [];

                                        return (
                                            <CTableRow key={itemData.item.id}>
                                                <CTableDataCell>{index + 1}</CTableDataCell>
                                                <CTableDataCell>
                                                    <strong>{itemData.item.name}</strong>
                                                </CTableDataCell>
                                                <CTableDataCell>{itemData.item.brand || '-'}</CTableDataCell>
                                                <CTableDataCell>{itemData.item.qty}</CTableDataCell>
                                                <CTableDataCell>{itemData.item.uom}</CTableDataCell>

                                                {/* Render up to 5 supplier columns */}
                                                {[0, 1, 2, 3, 4].map(supplierIndex => {
                                                    const supplier = suppliers[supplierIndex];

                                                    if (!supplier) {
                                                        return <CTableDataCell key={supplierIndex} className="text-center text-muted">-</CTableDataCell>;
                                                    }

                                                    const isLowest = parseFloat(supplier.final_price) === lowestPrice;
                                                    const isSelected = supplier.is_selected;

                                                    return (
                                                        <CTableDataCell
                                                            key={supplierIndex}
                                                            className={`text-center ${isLowest ? 'bg-success bg-opacity-10' : ''}`}
                                                        >
                                                            <div className="mb-1">
                                                                <strong>{supplier.seller_name}</strong>
                                                            </div>
                                                            <div className={`mb-1 ${isLowest ? 'text-success fw-bold' : ''}`}>
                                                                ${parseFloat(supplier.final_price).toFixed(2)}
                                                            </div>
                                                            {supplier.discount_percent > 0 && (
                                                                <div className="small text-muted">
                                                                    ({supplier.discount_percent}% off)
                                                                </div>
                                                            )}
                                                            {supplier.alternative_brand && (
                                                                <div className="small text-info">
                                                                    Alt: {supplier.alternative_brand}
                                                                </div>
                                                            )}
                                                            <div className="mt-2">
                                                                {isSelected ? (
                                                                    <CBadge color="success">
                                                                        <CIcon icon={cilCheckCircle} className="me-1" />
                                                                        Selected
                                                                    </CBadge>
                                                                ) : (
                                                                    <CButton
                                                                        color="primary"
                                                                        size="sm"
                                                                        onClick={() => handleSelectSupplier(itemData.item.id, supplier.quotation_id)}
                                                                        disabled={selecting[itemData.item.id]}
                                                                    >
                                                                        {selecting[itemData.item.id] ? (
                                                                            <CSpinner size="sm" />
                                                                        ) : (
                                                                            'Accept'
                                                                        )}
                                                                    </CButton>
                                                                )}
                                                            </div>
                                                        </CTableDataCell>
                                                    );
                                                })}
                                            </CTableRow>
                                        );
                                    })}
                                </CTableBody>
                            </CTable>
                        </div>

                        {/* Summary Section */}
                        <div className="mt-4">
                            <h6>Summary</h6>
                            <p className="text-muted">
                                Showing top 5 suppliers per item based on lowest final price (after discount).
                                Click "Accept" to select a supplier for each item.
                            </p>
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default QuotationComparison;
