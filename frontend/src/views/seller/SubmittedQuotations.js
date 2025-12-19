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
import { quotationAPI } from '../../services/quotationService';
import CIcon from '@coreui/icons-react';
import { cilPencil } from '@coreui/icons';

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
        return (
            <CBadge color={statusColors[status] || 'primary'}>
                {status.toUpperCase()}
            </CBadge>
        );
    };

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>My Submitted Quotations</strong>
                    </CCardHeader>
                    <CCardBody>
                        {loading ? (
                            <div className="text-center py-5">
                                <CSpinner color="primary" />
                            </div>
                        ) : quotations.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <p>No quotations found.</p>
                                <small>All quotations submitted by your account and sub-users will appear here.</small>
                            </div>
                        ) : (
                            <CTable hover responsive>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell scope="col">#</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Tender Title</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Items</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Delivery Period</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Submitted On</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {quotations.map((q, index) => (
                                        <CTableRow key={q.id}>
                                            <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                            <CTableDataCell>
                                                <strong>{q.tender_title}</strong>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CBadge color="primary">{q.item_count}</CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell>{q.delivery_period || 'N/A'}</CTableDataCell>
                                            <CTableDataCell>{getStatusBadge(q.status)}</CTableDataCell>
                                            <CTableDataCell>{formatDate(q.submitted_at || q.created_at)}</CTableDataCell>
                                            <CTableDataCell>
                                                <CButton
                                                    color="primary"
                                                    size="sm"
                                                    onClick={() => {
                                                        const path = q.invitation_token
                                                            ? `/seller/submit-quotation/${q.invitation_token}`
                                                            : `/seller/submit-quotation/tender/${q.tender_id}`;
                                                        navigate(path);
                                                    }}
                                                >
                                                    <CIcon icon={cilPencil} className="me-1" />
                                                    Re-Submit
                                                </CButton>
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

export default SubmittedQuotations;
