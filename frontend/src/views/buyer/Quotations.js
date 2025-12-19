import React, { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { tenderAPI } from '../../services/tenderService';
import CIcon from '@coreui/icons-react';
import { cilPlus } from '@coreui/icons';

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
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <strong>My Quotations</strong>
                        <CButton
                            color="primary"
                            size="sm"
                            onClick={() => navigate('/buyer/add-quotation')}
                        >
                            <CIcon icon={cilPlus} className="me-2" />
                            Create New Quotation
                        </CButton>
                    </CCardHeader>
                    <CCardBody>
                        {loading ? (
                            <div className="text-center py-5">
                                <CSpinner color="primary" />
                            </div>
                        ) : tenders.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <p>No quotations found.</p>
                                <CButton
                                    color="primary"
                                    variant="outline"
                                    onClick={() => navigate('/buyer/add-quotation')}
                                >
                                    Create Your First Quotation
                                </CButton>
                            </div>
                        ) : (
                            <CTable hover responsive>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell scope="col">#</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Items</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Invitations</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Created</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {tenders.map((tender, index) => (
                                        <CTableRow key={tender.id}>
                                            <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                            <CTableDataCell>
                                                <strong>{tender.title}</strong>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                {tender.description?.substring(0, 60)}
                                                {tender.description?.length > 60 ? '...' : ''}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CBadge color="info">{tender.item_count || 0}</CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CBadge color="warning">{tender.invite_count || 0}</CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell>{getStatusBadge(tender.status)}</CTableDataCell>
                                            <CTableDataCell>{formatDate(tender.created_at)}</CTableDataCell>
                                            <CTableDataCell>
                                                <CButton
                                                    color="info"
                                                    size="sm"
                                                    onClick={() => navigate(`/buyer/quotation-comparison/${tender.id}`)}
                                                >
                                                    View Comparison
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

export default Quotations;
