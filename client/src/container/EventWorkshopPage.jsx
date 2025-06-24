import { useState, useEffect, useContext } from "react";
import { images } from '../../public/index.js';
import GeneralUserCalendar from "../component/GeneralUserCalendar.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShare, faCalendarAlt, faMapMarkerAlt, faClock, faUserTie } from "@fortawesome/free-solid-svg-icons";
import ApiContext from "../context/ApiContext.jsx";
import { momentLocalizer } from "react-big-calendar";
import moment from 'moment-timezone';
import React from 'react';
import { motion } from 'framer-motion';

const EventDetailsModal = ({ event, isOpen, onClose }) => {
  if (!isOpen || !event || event.Status !== "Approved") return null;

  const downloadICS = () => {
    // ICS file generation logic here
    alert("ICS download functionality will be implemented here");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-gradient-to-br from-DGXblue to-DGXgreen rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Event Details</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            &times;
          </button>
        </div>
        
        <div className="bg-white bg-opacity-90 rounded-lg p-6 space-y-4">
          {event.EventImage && (
            <img 
              src={event.EventImage} 
              alt="Event Poster" 
              className="w-full h-64 object-cover rounded-lg mb-4 shadow-md" 
            />
          )}
          
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-DGXblue">{event.EventTitle}</h3>
              <p className="text-gray-600 italic">{event.Category}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-DGXgreen mt-1 mr-2" />
                <div>
                  <p className="font-semibold">Date & Time</p>
                  <p>
                    {moment.utc(event.StartDate).format("MMMM D, YYYY h:mm A")} - {' '}
                    {moment.utc(event.EndDate).format("h:mm A")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-DGXgreen mt-1 mr-2" />
                <div>
                  <p className="font-semibold">Venue</p>
                  <p>{event.Venue}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FontAwesomeIcon icon={faUserTie} className="text-DGXgreen mt-1 mr-2" />
                <div>
                  <p className="font-semibold">Host</p>
                  <p>{event.Host}</p>
                </div>
              </div>
              
              {event.RegistrationLink && (
                <div className="flex items-start">
                  <FontAwesomeIcon icon={faClock} className="text-DGXgreen mt-1 mr-2" />
                  <div>
                    <p className="font-semibold">Registration</p>
                    <a 
                      href={event.RegistrationLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-DGXblue hover:underline"
                    >
                      Register Here
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold text-lg">Description</h4>
              <div 
                className="prose max-w-none text-gray-700" 
                dangerouslySetInnerHTML={{ __html: event.EventDescription }} 
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            {event.RegistrationLink && (
              <a
                href={event.RegistrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-DGXblue hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-all shadow-md hover:shadow-lg"
              >
                Register Now
              </a>
            )}
            <button 
              onClick={downloadICS} 
              className="bg-DGXgreen hover:bg-green-600 text-white px-6 py-2 rounded-full transition-all shadow-md hover:shadow-lg"
            >
              Add to Calendar
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-full transition-all shadow-md hover:shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventWorkshopPage = () => {
  const [activeTab, setActiveTab] = useState("myCompany");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchData } = useContext(ApiContext);
  const [dbevents, setDbvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMoreInfoClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleTabChange = (tab) => {
    setIsAnimating(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsAnimating(false);
    }, 300);
  };

  const handleShare = async (event) => {
    const shareData = {
      title: event.EventTitle,
      text: `Check out this event: ${event.EventTitle}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("Error sharing event:", error);
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
        alert("Link copied to clipboard!");
      } catch (error) {
        console.error("Error copying link to clipboard:", error);
      }
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const endpoint = "eventandworkshop/getEvent";
        const eventData = await fetchData(endpoint);
        const approvedEvents = eventData.data.filter(event => event.Status === "Approved");
        setDbvents(approvedEvents);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching event data:", error);
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [fetchData]);

  const currentDate = new Date().toISOString();
  const upcomingEvents = dbevents.filter(event => event.StartDate > currentDate);
  const pastEvents = dbevents.filter(event => event.EndDate < currentDate);

  return (
    <div className="w-full bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-DGXblue to-DGXgreen py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Explore Events and Workshops
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-white opacity-90 mb-8"
          >
            Discover upcoming opportunities to learn, network, and grow with our curated events
          </motion.p>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-DGXblue mb-4">Upcoming Events</h2>
          <div className="w-24 h-1 bg-DGXgreen mx-auto"></div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.filter(event => event.Status === "Approved").map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative">
                  <img
                    src={event.EventImage}
                    alt={`Image for ${event.EventTitle}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-DGXgreen text-white text-xs font-bold px-2 py-1 rounded">
                    Upcoming
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.EventTitle}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-DGXgreen" />
                    <span>{moment.utc(event.StartDate).format("MMMM D, YYYY")}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-DGXgreen" />
                    <span>{event.Venue}</span>
                  </div>
                  <div className="flex justify-between space-x-3">
                    <button
                      onClick={() => handleViewDetails(event)}
                      className="flex-1 bg-DGXblue hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleShare(event)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition flex items-center justify-center"
                    >
                      <FontAwesomeIcon icon={faShare} className="mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl text-gray-600 mb-2">No upcoming events scheduled</h3>
            <p className="text-gray-500">Check back later for new events!</p>
          </div>
        )}
      </section>

      {/* Calendar Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white rounded-xl shadow-sm mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-DGXblue mb-4">Event Calendar</h2>
          <div className="w-24 h-1 bg-DGXgreen mx-auto"></div>
        </div>
        <GeneralUserCalendar events={dbevents} />
      </section>

      {/* Past Events Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-DGXblue mb-4">Past Events</h2>
          <div className="w-24 h-1 bg-DGXgreen mx-auto"></div>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Relive the knowledge and experiences from our previous events and workshops
          </p>
        </div>

        <div className="space-y-8">
          {pastEvents.length > 0 ? (
            pastEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img
                      src={event.EventImage}
                      alt={event.EventTitle}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-2/3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.EventTitle}</h3>
                        <p className="text-DGXgreen font-medium mb-2">{event.Category}</p>
                      </div>
                      <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        Past Event
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-DGXgreen mr-2" />
                        <span>{moment.utc(event.StartDate).format("MMMM D, YYYY")}</span>
                      </div>
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-DGXgreen mr-2" />
                        <span>{event.Venue}</span>
                      </div>
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faUserTie} className="text-DGXgreen mr-2" />
                        <span>Hosted by {event.Host}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 line-clamp-3 text-gray-600">
                      {event.EventDescription.replace(/<[^>]+>/g, '').substring(0, 200)}...
                    </div>
                    
                    <button
                      onClick={() => handleMoreInfoClick(event)}
                      className="mt-6 inline-flex items-center text-DGXblue hover:text-DGXgreen font-medium"
                    >
                      View Event Details
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl text-gray-600 mb-2">No past events to display</h3>
              <p className="text-gray-500">Our event history will appear here</p>
            </div>
          )}
        </div>
      </section>

      <EventDetailsModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default EventWorkshopPage;