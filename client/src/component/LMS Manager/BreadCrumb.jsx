import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import PropTypes from 'prop-types';

const BreadCrumb = ({ customPaths = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { state } = location;

  // State to track current module/submodule names
  const [currentModule, setCurrentModule] = useState({
    name: state?.moduleName || localStorage.getItem('moduleName'),
    id: params.moduleId || localStorage.getItem('moduleId')
  });
  
  const [currentSubmodule, setCurrentSubmodule] = useState({
    name: state?.submoduleName || localStorage.getItem('submoduleName'),
    id: params.subModuleId || localStorage.getItem('subModuleId')
  });

  // Update state when navigation occurs
  useEffect(() => {
    // Store module info if present in state
    if (state?.moduleName) {
      localStorage.setItem('moduleName', state.moduleName);
      localStorage.setItem('moduleId', state.moduleId);
    }
    
    // Store submodule info if present in state
    if (state?.submoduleName) {
      localStorage.setItem('submoduleName', state.submoduleName);
      localStorage.setItem('subModuleId', state.submoduleId);
    }

    setCurrentModule({
      name: state?.moduleName || localStorage.getItem('moduleName'),
      id: params.moduleId || localStorage.getItem('moduleId')
    });
    
    setCurrentSubmodule({
      name: state?.submoduleName || localStorage.getItem('submoduleName'),
      id: params.subModuleId || localStorage.getItem('subModuleId')
    });
  }, [location, params, state]);

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
        isActive: pathnames.includes('module') && !pathnames.includes('submodule')
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
              onClick={() => navigate(item.path, {
                state: {
                  moduleName: currentModule.name,
                  moduleId: currentModule.id,
                  ...(item.label === currentSubmodule.name ? {
                    submoduleName: currentSubmodule.name,
                    submoduleId: currentSubmodule.id
                  } : {})
                }
              })}
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