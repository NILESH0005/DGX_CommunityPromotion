import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import PropTypes from 'prop-types';

const BreadCrumb = ({ customPaths = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { state } = location;

  // Remove file extension from name
  const removeExtension = (filename) => {
    return filename?.replace(/\.[^/.]+$/, "") || '';
  };

  // Generate breadcrumb items based on route
  const getBreadcrumbItems = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const items = [];
    
    // Always start with Modules
    items.push({
      label: 'Modules',
      path: '/LearningPath',
      isActive: false,
      state: null
    });

    // Module level
    if (pathnames.includes('module') && (state?.moduleName || params.moduleId)) {
      items.push({
        label: state?.moduleName || `Module ${params.moduleId}`,
        path: `/module/${params.moduleId}`,
        isActive: pathnames.length === 2 && !pathnames.includes('submodule'), // Active if we're at module level
        state: { moduleName: state?.moduleName }
      });
    }

    // Submodule level
    if (pathnames.includes('submodule') && (state?.submoduleName || params.subModuleId)) {
      const isSubmoduleActive = pathnames.length === 2 && pathnames.includes('submodule');
      
      items.push({
        label: state?.submoduleName || `Submodule ${params.subModuleId}`,
        path: `/submodule/${params.subModuleId}`,
        isActive: isSubmoduleActive,
        state: {
          moduleName: state?.moduleName,
          submoduleName: state?.submoduleName,
          moduleId: state?.moduleId
        }
      });
    }

    // Unit File level - Check if we're in a unit file view
    // This handles cases where we're viewing files within a submodule
    if (params.subModuleId && state?.unitName && !pathnames.includes('submodule')) {
      // Add submodule breadcrumb if we're in unit file view but coming from submodule
      if (state?.submoduleName) {
        items.push({
          label: state.submoduleName,
          path: `/submodule/${params.subModuleId}`,
          isActive: false,
          state: {
            moduleName: state?.moduleName,
            submoduleName: state?.submoduleName,
            moduleId: state?.moduleId
          }
        });
      }
      
      // Add unit file name as the last breadcrumb (non-clickable)
      items.push({
        label: state.unitName,
        path: null, // Current page, not clickable
        isActive: true
      });
    }

    // File level (from state) - for individual file views
    if (state?.fileName && !state?.unitName) {
      items.push({
        label: removeExtension(state.fileName),
        path: null, // Current page, not clickable
        isActive: true
      });
    }

    // Handle file-viewer route specifically
    if (pathnames.includes('file-viewer') && state) {
      // Ensure we have submodule in breadcrumb if not already added
      if (state?.submoduleName && !items.some(item => item.label === state.submoduleName)) {
        items.push({
          label: state.submoduleName,
          path: `/submodule/${state.submoduleId}`,
          isActive: false,
          state: {
            moduleName: state?.moduleName,
            submoduleName: state?.submoduleName,
            moduleId: state?.moduleId
          }
        });
      }
            if (state?.fileName) {
        items.push({
          label: removeExtension(state.fileName),
          path: null, // Current page, not clickable
          isActive: true
        });
      }
    }

    return [...items, ...customPaths];
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav className="flex items-center flex-wrap gap-2 text-sm text-gray-600 mb-6 bg-white rounded-lg px-4 py-3 shadow-sm">
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
            <span className={`${
              item.isActive ? 'font-semibold text-gray-800' : 'font-medium text-gray-500'
            }`}>
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
      isActive: PropTypes.bool,
      state: PropTypes.object
    })
  )
};

export default BreadCrumb;