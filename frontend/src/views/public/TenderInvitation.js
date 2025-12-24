import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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
                <div className="container" style={{ maxWidth: '600px' }}>
                    <div className="alert alert-danger text-center" role="alert">
                        <h4>Access Denied</h4>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-vh-100 bg-light py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        {/* Header / Info */}
                        <div className="card mb-4 border-top border-3 border-primary shadow-sm">
                            <div className="card-header bg-white p-4">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 className="text-muted text-uppercase fw-bold mb-1">Invitation to Tender</h6>
                                        <h2 className="mb-2 text-primary">{tender?.title}</h2>
                                        <span className="badge bg-success">OPEN</span>
                                    </div>
                                    <div className="text-end text-muted small">
                                        <div>Ref: #{tender?.id}</div>
                                        <div>Date: {new Date(tender?.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body p-4">
                                <h5>Description</h5>
                                <p className="text-secondary">{tender?.description || 'No detailed description provided.'}</p>

                                <hr className="my-4" />

                                <div className="bg-light p-3 rounded border">
                                    <h6 className="fw-bold text-dark">Required Documents</h6>
                                    <p className="mb-0 text-danger small" style={{ whiteSpace: 'pre-wrap' }}>
                                        {tender?.required_documents || 'No specific document requirements listed.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white fw-bold py-3">
                                Items / Bill of Quantities
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th scope="col">Item Name</th>
                                                <th scope="col">Description / Specs</th>
                                                <th scope="col">Unit</th>
                                                <th scope="col" className="text-center">Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="fw-semibold">{item.item_name}</td>
                                                    <td className="small text-muted">
                                                        {[
                                                            item.brand && `Brand: ${item.brand}`,
                                                            item.country_of_origin && `Origin: ${item.country_of_origin}`,
                                                            item.strength && `Strength: ${item.strength}`
                                                        ].filter(Boolean).join(', ') || '-'}
                                                        {item.allow_alternative === 1 && <div className="text-success mt-1">✓ Alternative allowed</div>}
                                                    </td>
                                                    <td>{item.unit_of_measure}</td>
                                                    <td className="text-center fw-bold">{item.qty}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Action Area (Future Scope) */}
                        <div className="mt-4 text-center text-muted small">
                            To submit a quotation, please follow the instructions in your email or contact the buyer directly.
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default TenderInvitation
