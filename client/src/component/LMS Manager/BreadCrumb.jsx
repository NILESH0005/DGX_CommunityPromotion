import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import PropTypes from 'prop-types';

const BreadCrumb = ({ customPaths = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { state } = location;

  // State to track navigation history
  const [navHistory, setNavHistory] = useState(() => {
    // Initialize from localStorage if available
    const savedHistory = localStorage.getItem('navHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // Update navigation history when location changes
  useEffect(() => {
    const newEntry = {
      pathname: location.pathname,
      state: location.state,
      params: params,
      timestamp: Date.now()
    };

    // Check if this is a new navigation or going back
    const isNewNavigation = !navHistory.some(entry => 
      entry.pathname === location.pathname && 
      JSON.stringify(entry.params) === JSON.stringify(params)
    );

    if (isNewNavigation) {
      const updatedHistory = [...navHistory, newEntry];
      setNavHistory(updatedHistory);
      localStorage.setItem('navHistory', JSON.stringify(updatedHistory));
    }
  }, [location, params]);

  // Get current module info from most recent relevant navigation entry
  const getCurrentModule = () => {
    // Look backwards through history to find most recent module info
    for (let i = navHistory.length - 1; i >= 0; i--) {
      const entry = navHistory[i];
      if (entry.state?.moduleName) {
        return {
          name: entry.state.moduleName,
          id: entry.state.moduleId || entry.params?.moduleId
        };
      }
    }
    // Fallback to localStorage
    return {
      name: localStorage.getItem('moduleName'),
      id: localStorage.getItem('moduleId')
    };
  };

  // Get current submodule info from most recent relevant navigation entry
  const getCurrentSubmodule = () => {
    // Look backwards through history to find most recent submodule info
    for (let i = navHistory.length - 1; i >= 0; i--) {
      const entry = navHistory[i];
      if (entry.state?.submoduleName) {
        return {
          name: entry.state.submoduleName,
          id: entry.state.submoduleId || entry.params?.subModuleId
        };
      }
    }
    // Fallback to localStorage
    return {
      name: localStorage.getItem('submoduleName'),
      id: localStorage.getItem('subModuleId')
    };
  };

  const currentModule = getCurrentModule();
  const currentSubmodule = getCurrentSubmodule();

  // Generate breadcrumb items based on route
  const getBreadcrumbItems = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const items = [];
    
    // Always start with Modules
    items.push({
      label: 'Modules',
      path: '/LearningPath',
      isActive: false
    });

    // Module level (show if we have module info and we're at module or submodule level)
    if (currentModule.name && (pathnames.includes('module') || pathnames.includes('submodule'))) {
      items.push({
        label: currentModule.name,
        path: `/module/${currentModule.id}`,
        isActive: pathnames.includes('module') && !pathnames.includes('submodule'),
        state: {
          moduleName: currentModule.name,
          moduleId: currentModule.id
        }
      });
    }

    // Submodule level (only show if we're at submodule level)
    if (pathnames.includes('submodule') && currentSubmodule.name) {
      items.push({
        label: currentSubmodule.name,
        path: null, // Current page - no link
        isActive: true
      });
    }

    return [...items, ...customPaths];
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6 bg-white rounded-lg px-4 py-3 shadow-sm">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-gray-400 mx-1">
              <FaChevronRight className="w-3 h-3" />
            </span>
          )}
          {item.path ? (
            <button
              onClick={() => navigate(item.path, { state: item.state })}
              className={`hover:text-blue-600 transition-colors duration-200 ${
                item.isActive ? 'font-semibold text-gray-800' : 'font-medium text-gray-500'
              }`}
            >
              {item.label}
            </button>
          ) : (
            <span className="font-semibold text-gray-800">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

BreadCrumb.propTypes = {
  customPaths: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
      isActive: PropTypes.bool
    })
  )
};

export default BreadCrumb;