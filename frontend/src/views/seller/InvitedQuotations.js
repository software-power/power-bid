import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    CBadge,
    CButton,
    CSpinner,
} from '@coreui/react';
import { tenderAPI } from '../../services/tenderService';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilExternalLink } from '@coreui/icons';

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
        return (
            <CBadge color={statusColors[status] || 'secondary'}>
                {status.toUpperCase()}
            </CBadge>
        );
    };

    const handleSubmitQuotation = (token) => {
        navigate(`/seller/submit-quotation/${token}`);
    };

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Invited Quotations</strong>
                    </CCardHeader>
                    <CCardBody>
                        {loading ? (
                            <div className="text-center py-5">
                                <CSpinner color="primary" />
                            </div>
                        ) : invitations.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <p>No invitations found.</p>
                                <small>You will see quotation invitations here when buyers invite you.</small>
                            </div>
                        ) : (
                            <CTable hover responsive>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell scope="col">#</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Buyer</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Invited On</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {invitations.map((invitation, index) => (
                                        <CTableRow key={index}>
                                            <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                            <CTableDataCell>
                                                <strong>{invitation.title}</strong>
                                            </CTableDataCell>
                                            <CTableDataCell>{invitation.buyer_name}</CTableDataCell>
                                            <CTableDataCell>
                                                {invitation.description?.substring(0, 50)}
                                                {invitation.description?.length > 50 ? '...' : ''}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                {getStatusBadge(invitation.invitation_status)}
                                            </CTableDataCell>
                                            <CTableDataCell>{formatDate(invitation.invited_at)}</CTableDataCell>
                                            <CTableDataCell>
                                                <div className="d-flex gap-2">
                                                    <CButton
                                                        color="info"
                                                        size="sm"
                                                        onClick={() => window.open(`#/tender/invitation/${invitation.invitation_token}`, '_blank')}
                                                    >
                                                        <CIcon icon={cilExternalLink} className="me-1" />
                                                        View Details
                                                    </CButton>
                                                    <CButton
                                                        color="primary"
                                                        size="sm"
                                                        onClick={() => navigate(`/seller/submit-quotation/tender/${invitation.tender_id}`)}
                                                    >
                                                        <CIcon icon={cilPencil} className="me-1" />
                                                        Submit Quotation
                                                    </CButton>
                                                </div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))}
                                </CTableBody>
                            </CTable>
                        )}
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default InvitedQuotations;
