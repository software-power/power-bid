import React, { useState, useRef } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CForm,
    CFormLabel,
    CFormInput,
    CFormTextarea,
    CButton,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CFormCheck,
    CToaster,
    CToast,
    CToastBody,
    CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash, cilSend, cilCloudDownload } from '@coreui/icons'
import * as XLSX from 'xlsx'
import { tenderAPI } from '../../services/tenderService'

const AddQuotation = () => {
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(0)
    const toaster = useRef()

    // Tender Details
    const [tenderData, setTenderData] = useState({
        title: '',
        description: '',
        required_documents: 'TIN Certificate, Business Licence, Certificate of Incorporation',
    })

    // Dynamic Items
    const [items, setItems] = useState([
        { itemName: '', brand: '', countryOfOrigin: '', strength: '', unitOfMeasure: '', qty: 1, allowAlternative: false },
    ])

    // Invitations
    const [emailInput, setEmailInput] = useState('')
    const [invitedEmails, setInvitedEmails] = useState([])

    const addToast = (message, color = 'success') => {
        setToast(
            <CToast autohide={true} visible={true} color={color} className="text-white align-items-center">
                <div className="d-flex">
                    <CToastBody>{message}</CToastBody>
                </div>
            </CToast>
        )
    }

    // Handle Tender Data Change
    const handleTenderChange = (e) => {
        const { name, value } = e.target
        setTenderData({ ...tenderData, [name]: value })
    }

    // Handle Item Change
    const handleItemChange = (index, field, value) => {
        const newItems = [...items]
        newItems[index][field] = value
        setItems(newItems)
    }

    // Add Item Row
    const addItem = () => {
        setItems([
            ...items,
            { itemName: '', brand: '', countryOfOrigin: '', strength: '', unitOfMeasure: '', qty: 1, allowAlternative: false },
        ])
    }

    // Remove Item Row
    const removeItem = (index) => {
        if (items.length === 1) return
        const newItems = items.filter((_, i) => i !== index)
        setItems(newItems)
    }

    // Handle Email Input
    const handleEmailKeyDown = (e) => {
        if (['Enter', 'Tab', ','].includes(e.key)) {
            e.preventDefault()
            const email = emailInput.trim()
            if (email) {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    addToast('Invalid email format', 'warning')
                    return
                }
                if (!invitedEmails.includes(email)) {
                    setInvitedEmails([...invitedEmails, email])
                    setEmailInput('')
                }
            }
        }
    }

    const removeEmail = (email) => {
        setInvitedEmails(invitedEmails.filter((e) => e !== email))
    }

    // Download Excel Template
    const handleDownloadTemplate = () => {
        const headers = [
            'Item Name',
            'Brand',
            'Country of Origin',
            'Strength',
            'Unit of Measure',
            'Quantity',
            'Allow Alternative',
            'Remarks'
        ]

        // Create a worksheet
        const ws = XLSX.utils.aoa_to_sheet([headers])

        // Set column widths
        const wscols = [
            { wch: 30 }, // Item Name
            { wch: 15 }, // Brand
            { wch: 20 }, // Country of Origin
            { wch: 15 }, // Strength
            { wch: 15 }, // Unit of Measure
            { wch: 15 }, // Quantity
            { wch: 15 }, // Allow Alternative
            { wch: 30 }, // Remarks
        ]
        ws['!cols'] = wscols

        // Create a workbook
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Tender Items')

        // Generate file
        XLSX.writeFile(wb, 'tender_items_template.xlsx')
    }

    // File Upload Ref
    const fileInputRef = useRef(null)

    const handleUploadClick = () => {
        fileInputRef.current.click()
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data = XLSX.utils.sheet_to_json(ws)

                if (data.length === 0) {
                    addToast('Excel file is empty', 'warning')
                    return
                }

                const newItems = data.map(row => ({
                    itemName: row['Item Name'] || '',
                    brand: row['Brand'] || '',
                    countryOfOrigin: row['Country of Origin'] || '',
                    strength: row['Strength'] || '',
                    unitOfMeasure: row['Unit of Measure'] || '',
                    qty: row['Quantity'] || 1,
                    allowAlternative: (row['Allow Alternative'] && row['Allow Alternative'].toString().toLowerCase() === 'yes') ? true : false
                }))

                // Filter out default empty row if present and untouched
                let currentItems = [...items]
                if (currentItems.length === 1 && !currentItems[0].itemName && !currentItems[0].unitOfMeasure) {
                    currentItems = []
                }

                setItems([...currentItems, ...newItems])
                addToast(`Successfully imported ${newItems.length} items from ${file.name}`)

                // Clear input
                e.target.value = null

            } catch (error) {
                console.error('Error parsing Excel:', error)
                addToast('Failed to parse Excel file. Please check format.', 'danger')
            }
        }
        reader.readAsBinaryString(file)
    }

    // Submit Form
    const handleSubmit = async () => {
        if (!tenderData.title) {
            addToast('Please enter a tender title', 'danger')
            return
        }

        // Validate Items
        for (const item of items) {
            if (!item.itemName || !item.qty || !item.unitOfMeasure) {
                addToast('Please fill in required Item Name, Unit of Measure and Qty for all items', 'danger')
                return
            }
        }

        setLoading(true)
        try {
            const payload = {
                ...tenderData,
                items: items,
                invited_emails: invitedEmails
            }

            await tenderAPI.createQuotation(payload)
            addToast('Quotation created and invites sent successfully!')

            // Reset Form
            setTenderData({ title: '', description: '', required_documents: '' })
            setItems([{ itemName: '', brand: '', countryOfOrigin: '', strength: '', unitOfMeasure: '', qty: 1, allowAlternative: false }])
            setInvitedEmails([])
            setEmailInput('')

        } catch (error) {
            console.error(error)
            addToast(error.message || 'Failed to create quotation', 'danger')
        } finally {
            setLoading(false)
        }
    }

    return (
        <CRow>
            <CToaster ref={toaster} push={toast} placement="top-end" />
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Create New Quotation / Tender</strong>
                    </CCardHeader>
                    <CCardBody>
                        <CForm>
                            {/* Tender Info */}
                            <div className="mb-3">
                                <CFormLabel>Tender Title</CFormLabel>
                                <CFormInput
                                    name="title"
                                    placeholder="e.g. Supply of Office Stationery"
                                    value={tenderData.title}
                                    onChange={handleTenderChange}
                                />
                            </div>
                            <div className="mb-3">
                                <CFormLabel>Description</CFormLabel>
                                <CFormTextarea
                                    name="description"
                                    rows={3}
                                    placeholder="Brief description of the requirement..."
                                    value={tenderData.description}
                                    onChange={handleTenderChange}
                                />
                            </div>

                            {/* Items Section */}
                            <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
                                <h5 className="mb-0">Items Required</h5>
                                <div>
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileUpload}
                                    />
                                    <CButton color="primary" size="sm" variant="outline" className="me-2" onClick={handleUploadClick}>
                                        <CIcon icon={cilCloudDownload} className="me-2" style={{ transform: 'rotate(180deg)' }} />
                                        Upload Excel
                                    </CButton>
                                    <CButton color="success" size="sm" variant="outline" onClick={handleDownloadTemplate}>
                                        <CIcon icon={cilCloudDownload} className="me-2" />
                                        Download Template
                                    </CButton>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <CTable bordered>
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell>Item Name*</CTableHeaderCell>
                                            <CTableHeaderCell>Brand</CTableHeaderCell>
                                            <CTableHeaderCell>Origin</CTableHeaderCell>
                                            <CTableHeaderCell>Strength</CTableHeaderCell>
                                            <CTableHeaderCell>UoM*</CTableHeaderCell>
                                            <CTableHeaderCell style={{ width: '80px' }}>Qty*</CTableHeaderCell>
                                            <CTableHeaderCell style={{ width: '80px' }}>Alt?</CTableHeaderCell>
                                            <CTableHeaderCell style={{ width: '50px' }}></CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {items.map((item, index) => (
                                            <CTableRow key={index}>
                                                <CTableDataCell>
                                                    <CFormInput
                                                        size="sm"
                                                        value={item.itemName}
                                                        onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CFormInput
                                                        size="sm"
                                                        value={item.brand}
                                                        onChange={(e) => handleItemChange(index, 'brand', e.target.value)}
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CFormInput
                                                        size="sm"
                                                        value={item.countryOfOrigin}
                                                        onChange={(e) => handleItemChange(index, 'countryOfOrigin', e.target.value)}
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CFormInput
                                                        size="sm"
                                                        value={item.strength}
                                                        onChange={(e) => handleItemChange(index, 'strength', e.target.value)}
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CFormInput
                                                        size="sm"
                                                        value={item.unitOfMeasure}
                                                        onChange={(e) => handleItemChange(index, 'unitOfMeasure', e.target.value)}
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CFormInput
                                                        type="number"
                                                        size="sm"
                                                        value={item.qty}
                                                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell className="text-center">
                                                    <CFormCheck
                                                        checked={item.allowAlternative}
                                                        onChange={(e) => handleItemChange(index, 'allowAlternative', e.target.checked)}
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {items.length > 1 && (
                                                        <CButton color="danger" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                                                            <CIcon icon={cilTrash} />
                                                        </CButton>
                                                    )}
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))}
                                    </CTableBody>
                                </CTable>
                            </div>
                            <CButton color="secondary" size="sm" onClick={addItem} className="mb-4">
                                <CIcon icon={cilPlus} className="me-2" /> Add Item
                            </CButton>

                            {/* Seller Invitation */}
                            <h5 className="mb-3">Seller Invitations</h5>
                            <div className="mb-3">
                                <CFormLabel>Invite Sellers (Enter Email and press Enter)</CFormLabel>
                                <div className="d-flex flex-wrap gap-2 mb-2 p-2 border rounded" style={{ minHeight: '40px' }}>
                                    {invitedEmails.map((email) => (
                                        <CBadge key={email} color="info" className="d-flex align-items-center p-2">
                                            {email}
                                            <span
                                                className="ms-2 cursor-pointer fw-bold text-white"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => removeEmail(email)}
                                            >×</span>
                                        </CBadge>
                                    ))}
                                    <input
                                        type="text"
                                        className="border-0 focus-visible-0"
                                        style={{ outline: 'none', minWidth: '150px' }}
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        onKeyDown={handleEmailKeyDown}
                                        placeholder={invitedEmails.length === 0 ? "Type email and press Enter..." : ""}
                                    />
                                </div>
                                <div className="form-text">Enter multiple emails to invite sellers securely.</div>
                            </div>

                            <div className="mb-4">
                                <CFormLabel>Required Documents (for invites)</CFormLabel>
                                <CFormTextarea
                                    name="required_documents"
                                    rows={3}
                                    value={tenderData.required_documents}
                                    onChange={handleTenderChange}
                                />
                                <div className="form-text">List documents sellers must upload (comma separated or new lines).</div>
                            </div>

                            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                <CButton color="primary" onClick={handleSubmit} disabled={loading}>
                                    {loading ? 'Processing...' : (
                                        <>
                                            <CIcon icon={cilSend} className="me-2" /> Publish & Send Invites
                                        </>
                                    )}
                                </CButton>
                            </div>

                        </CForm>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default AddQuotation
