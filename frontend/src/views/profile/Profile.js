import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { userAPI } from '../../services/userService'
import avatar8 from '../../assets/images/avatars/avata.png' // Fallback avatar
// import avatar8 from 'src/assets/images/avatars/8.jpg' // Depending on alias config, relative path is safer

const Profile = () => {
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        phone: '',
        joining_date: '',
        department: '',
        designation: '',
        address: '',
        country: '',
        role_id: '',
        type: ''
    })

    useEffect(() => {
        fetchUserProfile()
    }, [])

    const fetchUserProfile = async () => {
        try {
            setLoading(true)
            const storedUser = userAPI.getCurrentUser()
            if (storedUser) {
                // Prepare initial state from stored user data
                // For fields not yet in storedUser (like address), we use empty strings
                setProfile({
                    full_name: storedUser.full_name || '',
                    email: storedUser.email || '',
                    phone: storedUser.phone || '',
                    type: storedUser.type || '',
                    role_id: storedUser.role_id || '',
                    address: storedUser.address || '',
                    department: storedUser.department || '',
                    designation: storedUser.designation || '',
                    country: storedUser.country || '',
                    joining_date: storedUser.created_at ? new Date(storedUser.created_at).toLocaleDateString() : new Date().toLocaleDateString()
                })
            }
            setLoading(false)
        } catch (err) {
            toast.error('Failed to load profile')
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setProfile(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
        try {
            setUpdating(true)
            const storedUser = userAPI.getCurrentUser()
            if (storedUser && storedUser.id) {
                await userAPI.updateUser(storedUser.id, profile)
                toast.success('Profile updated successfully')

                // Update local storage to reflect changes immediately
                // Note: Ideally we should refetch the user from backend to get the authoritative state
                // especially if backend does some processing. But for now updating local copy is good UX.
                const updatedUser = { ...storedUser, ...profile }
                localStorage.setItem('user', JSON.stringify(updatedUser))
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update profile')
        } finally {
            setUpdating(false)
        }
    }

    return (
        <div className="row">
            {/* Left Column: Profile Card */}
            <div className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm border-0">
                    <div className="card-body text-center d-flex flex-column justify-content-center align-items-center p-5">
                        <div className="position-relative mb-4">
                            <img
                                src={avatar8} // Use the imported image
                                alt="Profile"
                                className="rounded-circle border border-3 border-white shadow-sm"
                                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                            />
                            <button
                                className="btn btn-sm btn-white position-absolute bottom-0 end-0 rounded-circle shadow-sm border"
                                style={{ width: '35px', height: '35px' }}
                                title="Change Photo"
                            >
                                📷
                            </button>
                        </div>
                        <h4 className="mb-1 text-dark fw-bold">{profile.full_name || 'User Name'}</h4>
                        <p className="text-muted mb-1">{profile.designation || profile.role_id || 'Employee'}</p>
                        <span className="badge bg-light text-secondary border">{profile.department || 'General'}</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Details Form */}
            <div className="col-md-8 mb-4">
                <div className="card h-100 shadow-sm border-0">
                    <div className="card-header bg-white border-bottom-0 pt-4 px-4">
                        <h5 className="card-title text-primary d-flex align-items-center mb-0">
                            <span className="me-2 fs-5">🏠</span>
                            <span className="fw-semibold">Personal Details</span>
                        </h5>
                        <hr className="mt-3 text-primary opacity-25" />
                    </div>
                    <div className="card-body px-4 pb-4">
                        <form>
                            <div className="row mb-3">
                                <div className="col-md-6 mb-3 mb-md-0">
                                    <label className="form-label text-secondary small fw-bold">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="full_name"
                                        value={profile.full_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-secondary small fw-bold">Phone Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6 mb-3 mb-md-0">
                                    <label className="form-label text-secondary small fw-bold">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleChange}
                                        readOnly // Keeping email read-only for security as per typical flow
                                        disabled
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-secondary small fw-bold">Joining Date</label>
                                    <input
                                        type="text"
                                        className="form-control bg-light"
                                        value={profile.joining_date}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6 mb-3 mb-md-0">
                                    <label className="form-label text-secondary small fw-bold">Department</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="department"
                                        value={profile.department}
                                        placeholder="OPERATION"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-secondary small fw-bold">Designation</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="designation"
                                        value={profile.designation}
                                        placeholder="DRIVER"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="row mb-4">
                                <div className="col-md-6 mb-3 mb-md-0">
                                    <label className="form-label text-secondary small fw-bold">Address</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="address"
                                        value={profile.address}
                                        placeholder="Miembe Saba B, Kibaha, Pwani"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-secondary small fw-bold">Country</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="country"
                                        value={profile.country}
                                        placeholder="TANZANIA"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="d-flex justify-content-end">
                                <button
                                    type="button"
                                    className="btn btn-primary px-5 py-2 fw-semibold"
                                    onClick={handleSubmit}
                                    disabled={updating}
                                >
                                    {updating ? 'Updating...' : 'Updates'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
