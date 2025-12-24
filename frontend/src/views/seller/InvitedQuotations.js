import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenderAPI } from '../../services/tenderService';

const InvitedQuotations = () => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            setLoading(true);
            const response = await tenderAPI.getMyInvitations();
            setInvitations(response.data || []);
        } catch (error) {
            console.error('Error fetching invitations:', error);
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
            pending: 'warning',
            accepted: 'success',
            rejected: 'danger',
        };
        const color = statusColors[status] || 'secondary';
        return (
            <span className={`badge bg-${color} text-dark`}>
                {status.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="row">
            <div className="col-12">
                <div className="card mb-4">
                    <div className="card-header">
                        <strong>Invited Quotations</strong>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : invitations.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <p>No invitations found.</p>
                                <small>You will see quotation invitations here when buyers invite you.</small>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col">Title</th>
                                            <th scope="col">Buyer</th>
                                            <th scope="col">Description</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Invited On</th>
                                            <th scope="col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invitations.map((invitation, index) => (
                                            <tr key={index}>
                                                <th scope="row">{index + 1}</th>
                                                <td>
                                                    <strong>{invitation.title}</strong>
                                                </td>
                                                <td>{invitation.buyer_name}</td>
                                                <td>
                                                    {invitation.description?.substring(0, 50)}
                                                    {invitation.description?.length > 50 ? '...' : ''}
                                                </td>
                                                <td>
                                                    {getStatusBadge(invitation.invitation_status)}
                                                </td>
                                                <td>{formatDate(invitation.invited_at)}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className="btn btn-info btn-sm text-white"
                                                            onClick={() => window.open(`#/tender/invitation/${invitation.invitation_token}`, '_blank')}
                                                        >
                                                            <span className="me-1">↗</span>
                                                            View Details
                                                        </button>
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => navigate(`/seller/submit-quotation/tender/${invitation.tender_id}`)}
                                                        >
                                                            <span className="me-1">✎</span>
                                                            Submit Quotation
                                                        </button>
                                                    </div>
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

export default InvitedQuotations;
