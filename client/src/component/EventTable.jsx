import React, { useRef, useState, useContext, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ApiContext from '../context/ApiContext.jsx';
import EventForm from './eventAndWorkshop/EventForm.jsx';
import DetailsEventModal from './eventAndWorkshop/DetailsEventModal.jsx';
import LoadPage from './LoadPage.jsx';
import Swal from 'sweetalert2';
import { FaEye } from 'react-icons/fa';

const EventTable = (props) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { fetchData, userToken } = useContext(ApiContext);
  const [isTokenLoading, setIsTokenLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownData, setDropdownData] = useState({
    categoryOptions: [],
    companyCategoryOptions: []
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const adjustedDate = new Date(date.getTime() - 5 * 60 * 60 * 1000 - 30 * 60 * 1000);
      return adjustedDate.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).replace(" at ", " ");
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Invalid Date";
    }
  };

  useEffect(() => {
    const fetchDropdownValues = async (category) => {
      try {
        const response = await fetch(`http://localhost:8000/dropdown/getDropdownValues?category=${category}`);
        const data = await response.json();
        return data.success ? data.data : [];
      } catch (error) {
        console.error('Error fetching dropdown values:', error);
        return [];
      }
    };

    const fetchCategories = async () => {
      const eventTypeOptions = await fetchDropdownValues('eventType');
      const eventHostOptions = await fetchDropdownValues('eventHost');

      const eventTypeDropdown = [
        { idCode: 'All', ddValue: 'All', ddCategory: 'eventType' },
        ...eventTypeOptions,
      ];

      setDropdownData({
        categoryOptions: eventTypeOptions,
        companyCategoryOptions: eventHostOptions
      });
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (userToken) {
      setIsTokenLoading(false);
      fetchEvents();
    } else {
      const timeoutId = setTimeout(() => {
        setIsTokenLoading(false);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [userToken]);

  const fetchEvents = async () => {
    const endpoint = "eventandworkshop/getEvent";
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const result = await fetchData(endpoint, method, {}, headers);
      if (result.success && Array.isArray(result.data)) {
        props.setEvents(result.data);
      } else {
        console.error("Invalid data format:", result);
        props.setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      props.setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = props.events.filter((event) => {
    const matchesStatus = statusFilter === "" || event.Status === statusFilter;
    const matchesCategory = selectedCategory === "" || event.EventType === selectedCategory;
    const matchesSearch =
      event.EventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.UserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.Venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.Status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDateTime(event.StartDate).toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDateTime(event.EndDate).toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-200 text-green-800";
      case "Rejected":
        return "bg-red-200 text-red-800";
      case "Pending":
        return "bg-yellow-200 text-yellow-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  if (isTokenLoading || loading) {
    return <LoadPage />;
  }

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="Search by title, creator, venue, etc..."
          className="p-2 border rounded w-full sm:w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select
            className="border px-3 py-2 rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select
            className="border px-3 py-2 rounded-lg"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Types</option>
            {dropdownData.categoryOptions.map((option) => (
              <option key={option.idCode} value={option.ddValue}>
                {option.ddValue}
              </option>
            ))}
          </select>
          <button
            className="px-4 py-2 bg-DGXblue text-white font-semibold rounded-lg"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Show Table' : 'Add Event'}
          </button>
        </div>
      </div>

      {showForm ? (
        <EventForm updateEvents={props.setEvents} setEvents={props.setEvents} />
      ) : filteredEvents.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-300">
          <div className="overflow-auto" style={{ maxHeight: "600px" }}>
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-DGXgreen text-white">
                  <th className="p-2 border text-center w-12">#</th>
                  <th className="p-2 border text-center min-w-[150px]">Title</th>
                  <th className="p-2 border text-center min-w-[120px]">Created By</th>
                  <th className="p-2 border text-center min-w-[180px]">Start Date & Time</th>
                  <th className="p-2 border text-center min-w-[180px]">End Date & Time</th>
                  <th className="p-2 border text-center min-w-[100px]">Status</th>
                  <th className="p-2 border text-center min-w-[120px]">Venue</th>
                  <th className="p-2 border text-center min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event, index) => (
                  <tr key={event.EventID} className={`hover:bg-gray-50 ${getStatusClass(event.Status)}`}>
                    <td className="p-2 border text-center">{index + 1}</td>
                    <td className="p-2 border text-center font-medium">
                      {event.EventTitle}
                    </td>
                    <td className="p-2 border text-center">{event.UserName}</td>
                    <td className="p-2 border text-center">{formatDateTime(event.StartDate)}</td>
                    <td className="p-2 border text-center">{formatDateTime(event.EndDate)}</td>
                    <td className="p-2 border text-center">{event.Status}</td>
                    <td className="p-2 border text-center">{event.Venue}</td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="bg-DGXblue text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
                      >
                        <FaEye />

                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">
          {searchTerm ? "No events match your search" : "No events found"}
        </p>
      )}

      {selectedEvent && (
        <DetailsEventModal
          selectedEvent={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEventUpdate={props.setEvents}
          onEventDelete={props.setEvents}
        />
      )}
    </div>
  );
};

export default EventTable;