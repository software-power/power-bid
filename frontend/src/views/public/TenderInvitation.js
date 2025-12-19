import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CContainer,
    CRow,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CAlert,
    CBadge,
} from '@coreui/react'
import { tenderAPI } from '../../services/tenderService'

const TenderInvitation = () => {
    const { token } = useParams()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [tender, setTender] = useState(null)
    const [items, setItems] = useState([])

    useEffect(() => {
        const fetchTender = async () => {
            try {
                const data = await tenderAPI.getTenderByToken(token)
                setTender(data.data.tender)
                setItems(data.data.items)
            } catch (err) {
                setError(err.message || 'Failed to load tender details. Link might be invalid or expired.')
            } finally {
                setLoading(false)
            }
        }

        if (token) {
            fetchTender()
        }
    }, [token])

    if (loading) {
        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
                <CContainer maxWidth="sm">
                    <CAlert color="danger" className="text-center">
                        <h4>Access Denied</h4>
                        <p>{error}</p>
                    </CAlert>
                </CContainer>
            </div>
        )
    }

    return (
        <div className="min-vh-100 bg-light py-5">
            <CContainer>
                <CRow className="justify-content-center">
                    <CCol lg={10}>
                        {/* Header / Info */}
                        <CCard className="mb-4 border-top-primary border-top-3 shadow-sm">
                            <CCardHeader className="bg-white p-4">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 className="text-muted text-uppercase fw-bold mb-1">Invitation to Tender</h6>
                                        <h2 className="mb-2 text-primary">{tender?.title}</h2>
                                        <CBadge color="success">OPEN</CBadge>
                                    </div>
                                    <div className="text-end text-muted small">
                                        <div>Ref: #{tender?.id}</div>
                                        <div>Date: {new Date(tender?.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </CCardHeader>
                            <CCardBody className="p-4">
                                <h5>Description</h5>
                                <p className="text-secondary">{tender?.description || 'No detailed description provided.'}</p>

                                <hr className="my-4" />

                                <div className="bg-light p-3 rounded border">
                                    <h6 className="fw-bold text-dark">Required Documents</h6>
                                    <p className="mb-0 text-danger small" style={{ whiteSpace: 'pre-wrap' }}>
                                        {tender?.required_documents || 'No specific document requirements listed.'}
                                    </p>
                                </div>
                            </CCardBody>
                        </CCard>

                        {/* Items Table */}
                        <CCard className="shadow-sm border-0">
                            <CCardHeader className="bg-white fw-bold py-3">
                                Items / Bill of Quantities
                            </CCardHeader>
                            <CCardBody className="p-0">
                                <CTable hover responsive className="mb-0">
                                    <CTableHead color="light">
                                        <CTableRow>
                                            <CTableHeaderCell>Item Name</CTableHeaderCell>
                                            <CTableHeaderCell>Description / Specs</CTableHeaderCell>
                                            <CTableHeaderCell>Unit</CTableHeaderCell>
                                            <CTableHeaderCell className="text-center">Quantity</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {items.map((item) => (
                                            <CTableRow key={item.id}>
                                                <CTableDataCell className="fw-semibold">{item.item_name}</CTableDataCell>
                                                <CTableDataCell className="small text-muted">
                                                    {[
                                                        item.brand && `Brand: ${item.brand}`,
                                                        item.country_of_origin && `Origin: ${item.country_of_origin}`,
                                                        item.strength && `Strength: ${item.strength}`
                                                    ].filter(Boolean).join(', ') || '-'}
                                                    {item.allow_alternative === 1 && <div className="text-success mt-1">✓ Alternative allowed</div>}
                                                </CTableDataCell>
                                                <CTableDataCell>{item.unit_of_measure}</CTableDataCell>
                                                <CTableDataCell className="text-center fw-bold">{item.qty}</CTableDataCell>
                                            </CTableRow>
                                        ))}
                                    </CTableBody>
                                </CTable>
                            </CCardBody>
                        </CCard>

                        {/* Action Area (Future Scope) */}
                        <div className="mt-4 text-center text-muted small">
                            To submit a quotation, please follow the instructions in your email or contact the buyer directly.
                        </div>

                    </CCol>
                </CRow>
            </CContainer>
        </div>
    )
}

export default TenderInvitation
