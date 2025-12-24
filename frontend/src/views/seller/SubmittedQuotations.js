import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quotationAPI } from '../../services/quotationService';

const SubmittedQuotations = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const response = await quotationAPI.getSubmittedQuotations();
            setQuotations(response.data || []);
        } catch (error) {
            console.error('Error fetching quotations:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            draft: 'secondary',
            submitted: 'info',
            accepted: 'success',
            rejected: 'danger',
        };
        const color = statusColors[status] || 'primary';
        return (
            <span className={`badge bg-${color} text-white`}>
                {status.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="row">
            <div className="col-12">
                <div className="card mb-4">
                    <div className="card-header">
                        <strong>My Submitted Quotations</strong>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : quotations.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <p>No quotations found.</p>
                                <small>All quotations submitted by your account and sub-users will appear here.</small>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col">Tender Title</th>
                                            <th scope="col">Items</th>
                                            <th scope="col">Delivery Period</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Submitted On</th>
                                            <th scope="col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quotations.map((q, index) => (
                                            <tr key={q.id}>
                                                <th scope="row">{index + 1}</th>
                                                <td>
                                                    <strong>{q.tender_title}</strong>
                                                </td>
                                                <td>
                                                    <span className="badge bg-primary">{q.item_count}</span>
                                                </td>
                                                <td>{q.delivery_period || 'N/A'}</td>
                                                <td>{getStatusBadge(q.status)}</td>
                                                <td>{formatDate(q.submitted_at || q.created_at)}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => {
                                                            const path = q.invitation_token
                                                                ? `/seller/submit-quotation/${q.invitation_token}`
                                                                : `/seller/submit-quotation/tender/${q.tender_id}`;
                                                            navigate(path);
                                                        }}
                                                    >
                                                        <span className="me-1">✎</span>
                                                        Re-Submit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmittedQuotations;
