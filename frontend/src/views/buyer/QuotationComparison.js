import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { quotationAPI } from '../../services/quotationService';
import { toast } from 'react-toastify';

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
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (comparison.length === 0) {
        return (
            <div className="alert alert-info" role="alert">
                No quotations have been submitted yet.
            </div>
        );
    }

    return (
        <div className="row">
            <div className="col-12">
                <div className="card mb-4">
                    <div className="card-header">
                        <strong>Quotation Comparison</strong>
                        <span className="badge bg-info text-dark ms-2">
                            {comparison.length} Items
                        </span>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover">
                                <thead>
                                    <tr>
                                        <th rowSpan={2} className="align-middle">#</th>
                                        <th rowSpan={2} className="align-middle">Item Name</th>
                                        <th rowSpan={2} className="align-middle">Brand</th>
                                        <th rowSpan={2} className="align-middle">Qty</th>
                                        <th rowSpan={2} className="align-middle">UoM</th>
                                        <th colSpan={5} className="text-center bg-light">
                                            Top 5 Suppliers (Lowest Price First)
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className="text-center bg-light">1st</th>
                                        <th className="text-center bg-light">2nd</th>
                                        <th className="text-center bg-light">3rd</th>
                                        <th className="text-center bg-light">4th</th>
                                        <th className="text-center bg-light">5th</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparison.map((itemData, index) => {
                                        const lowestPrice = getLowestPrice(itemData.suppliers);
                                        const suppliers = itemData.suppliers || [];

                                        return (
                                            <tr key={itemData.item.id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <strong>{itemData.item.name}</strong>
                                                </td>
                                                <td>{itemData.item.brand || '-'}</td>
                                                <td>{itemData.item.qty}</td>
                                                <td>{itemData.item.uom}</td>

                                                {/* Render up to 5 supplier columns */}
                                                {[0, 1, 2, 3, 4].map(supplierIndex => {
                                                    const supplier = suppliers[supplierIndex];

                                                    if (!supplier) {
                                                        return <td key={supplierIndex} className="text-center text-muted">-</td>;
                                                    }

                                                    const isLowest = parseFloat(supplier.final_price) === lowestPrice;
                                                    const isSelected = supplier.is_selected;

                                                    return (
                                                        <td
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
                                                                    <span className="badge bg-success">
                                                                        <span className="me-1">✓</span>
                                                                        Selected
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        className="btn btn-primary btn-sm"
                                                                        onClick={() => handleSelectSupplier(itemData.item.id, supplier.quotation_id)}
                                                                        disabled={selecting[itemData.item.id]}
                                                                    >
                                                                        {selecting[itemData.item.id] ? (
                                                                            <div className="spinner-border spinner-border-sm" role="status">
                                                                                <span className="visually-hidden">Loading...</span>
                                                                            </div>
                                                                        ) : (
                                                                            'Accept'
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Section */}
                        <div className="mt-4">
                            <h6>Summary</h6>
                            <p className="text-muted">
                                Showing top 5 suppliers per item based on lowest final price (after discount).
                                Click "Accept" to select a supplier for each item.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuotationComparison;
