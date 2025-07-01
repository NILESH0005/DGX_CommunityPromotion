import React, { useState, useEffect } from 'react';
import Map from '../constant/Map.jsx';
import Swal from 'sweetalert2';
import { useContext } from 'react';
import ApiContext from '../context/ApiContext.jsx';

const ContactUs = () => {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const { fetchData, userToken } = useContext(ApiContext);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        try {
            const endpoint = "user/sendContactEmail";
            const method = "POST";
            const body = {
                name: formData.name,
                email: formData.email,
                message: formData.message
            };
            const headers = {
                "Content-Type": "application/json",
                "auth-token": userToken || '' // Send empty if no token
            };
            
            const data = await fetchData(endpoint, method, body, headers);
            
            if (data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Your message has been sent successfully!",
                });
                setFormData({
                    name: '',
                    email: '',
                    message: ''
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: data.message || "Failed to send message",
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center">
            <section className="w-full max-w-7xl mb-8">
                {/* Contact Form and Info Section */}
                <div className="container px-8 md:px-12 mt-12">
                    <div className="block rounded-lg border border-DGXgreen shadow-md px-8 py-12 md:py-16 md:px-12">
                        <div className="flex flex-wrap">
                            {/* Contact Form */}
                            <div className="w-full md:w-1/2 lg:w-1/2 md:px-3 lg:px-6 mb-12">
                                {loading ? (
                                    <div className="space-y-5 animate-pulse">
                                        <div className="h-10 bg-DGXblue/45 rounded"></div>
                                        <div className="h-10 bg-DGXblue/45 rounded"></div>
                                        <div className="h-24 bg-DGXblue/45 rounded"></div>
                                        <div className="h-10 bg-DGXblue/45 rounded"></div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        {[
                                            { name: 'name', type: 'text', placeholder: 'Name' },
                                            { name: 'email', type: 'email', placeholder: 'Email address' },
                                            { name: 'message', type: 'textarea', placeholder: 'Message' }
                                        ].map((field, idx) => (
                                            <div className="relative mb-6" key={idx}>
                                                {field.type !== 'textarea' ? (
                                                    <>
                                                        <input
                                                            type={field.type}
                                                            name={field.name}
                                                            value={formData[field.name]}
                                                            onChange={handleChange}
                                                            className={`peer w-full rounded border-2 bg-transparent py-2 px-3 outline-none transition-all duration-200 focus:text-primary ${
                                                                errors[field.name] ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                            placeholder={field.placeholder}
                                                        />
                                                        {errors[field.name] && (
                                                            <p className="mt-1 text-sm text-red-500">{errors[field.name]}</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <textarea
                                                            name={field.name}
                                                            value={formData[field.name]}
                                                            onChange={handleChange}
                                                            className={`peer w-full rounded border-2 bg-transparent py-2 px-3 outline-none transition-all duration-200 focus:text-primary ${
                                                                errors[field.name] ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                            rows="3"
                                                            placeholder={field.placeholder}
                                                        ></textarea>
                                                        {errors[field.name] && (
                                                            <p className="mt-1 text-sm text-red-500">{errors[field.name]}</p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="submit"
                                            className="w-full rounded bg-DGXgreen text-DGXwhite px-6 py-2 font-medium uppercase text-xs hover:bg-DGXblue transition-colors"
                                            disabled={loading}
                                        >
                                            {loading ? 'Sending...' : 'Send'}
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Contact Information */}
                            <div className="w-full md:w-1/2 lg:w-1/2 md:px-3 lg:px-3">
                                {loading ? (
                                    <div className="space-y-7 animate-pulse">
                                        <div className="h-10 bg-DGXblue/45 rounded"></div>
                                        <div className="h-10 bg-DGXblue/45 rounded"></div>
                                        <div className="h-10 bg-DGXblue/45 rounded"></div>
                                        <div className="h-10 bg-DGXblue/45 rounded"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-7 ">
                                        {[
                                            { title: 'Address', content: 'Global Infoventures Pvt. Ltd. H-65 Sector 63, Noida' },
                                            { title: 'Email', content: 'info@giindia.com' },
                                            { title: 'Contact No', content: '+91 9876543210' },
                                            { title: 'Working hours', content: 'Mon - Fri: 10:00 AM - 06:00 PM' }
                                        ].map((info, idx) => (
                                            <div key={idx}>
                                                <h2 className="md:text-base font-bold text-primary ">{info.title}</h2>
                                                <p className="text-neutral-500 text-sm md:text-sm">{info.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Map Section */}
                        <div id="map" className="mt-8 relative h-[400px] w-full overflow-hidden bg-cover bg-no-repeat rounded-lg border border-DGXgreen shadow-xl">
                            {loading ? (
                                <div className="w-full h-full bg-DGXblue/50 animate-pulse" />
                            ) : (
                                <Map className="w-full h-full" />
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactUs;