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
  const moduleName = state?.moduleName || localStorage.getItem('moduleName');
  const moduleId = params.moduleId || localStorage.getItem('moduleId');
  
  if (moduleName && moduleId) {
    items.push({
      label: moduleName,
      path: `/module/${moduleId}`,
      isActive: pathnames.includes('module') && !pathnames.includes('submodule'),
      state: { moduleName }
    });
  }

  // Submodule level
  const submoduleName = state?.submoduleName || localStorage.getItem('submoduleName');
  const subModuleId = params.subModuleId || localStorage.getItem('subModuleId');
  
  if (submoduleName && subModuleId) {
    items.push({
      label: submoduleName,
      path: null, // Make non-clickable
      isActive: pathnames.includes('submodule'),
    });
  }

  // Unit level
  if (state?.unitName) {
    items.push({
      label: state.unitName,
      path: null,
      isActive: true
    });
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