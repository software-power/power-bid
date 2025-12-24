import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenderAPI } from '../../services/tenderService';

const Quotations = () => {
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTenders();
    }, []);

    const fetchTenders = async () => {
        try {
            setLoading(true);
            const response = await tenderAPI.getMyTenders();
            setTenders(response.data || []);
        } catch (error) {
            console.error('Error fetching tenders:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            published: 'success',
            draft: 'secondary',
            closed: 'danger',
        };
        const color = statusColors[status] || 'primary';
        return (
            <span className={`badge bg-${color}`}>
                {status.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="row">
            <div className="col-12">
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <strong>My Quotations</strong>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate('/buyer/add-quotation')}
                        >
                            <span className="me-2">+</span>
                            Create New Quotation
                        </button>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : tenders.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <p>No quotations found.</p>
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => navigate('/buyer/add-quotation')}
                                >
                                    Create Your First Quotation
                                </button>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col">Title</th>
                                            <th scope="col">Description</th>
                                            <th scope="col">Items</th>
                                            <th scope="col">Invitations</th>
                                            <th scope="col">Start Date</th>
                                            <th scope="col">End Date</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Created</th>
                                            <th scope="col">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tenders.map((tender, index) => (
                                            <tr key={tender.id}>
                                                <th scope="row">{index + 1}</th>
                                                <td>
                                                    <strong>{tender.title}</strong>
                                                </td>
                                                <td>
                                                    {tender.description?.substring(0, 60)}
                                                    {tender.description?.length > 60 ? '...' : ''}
                                                </td>
                                                <td>
                                                    <span className="badge bg-info text-dark">{tender.item_count || 0}</span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-warning text-dark">{tender.invite_count || 0}</span>
                                                </td>
                                                <td>{formatDate(tender.start_date)}</td>
                                                <td>{formatDate(tender.end_date)}</td>
                                                <td>{getStatusBadge(tender.status)}</td>
                                                <td>{formatDate(tender.created_at)}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-warning btn-sm me-2 text-white"
                                                        onClick={() => navigate(`/buyer/edit-quotation/${tender.id}`)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-info btn-sm text-white"
                                                        onClick={() => navigate(`/buyer/quotation-comparison/${tender.id}`)}
                                                    >
                                                        View Comparison
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

export default Quotations;
