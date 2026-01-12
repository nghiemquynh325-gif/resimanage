import React from 'react';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
  headerCheckbox?: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ headers, children, className = '', headerCheckbox }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${index === headers.length - 1 ? 'text-right' : ''
                  }`}
              >
                {index === 0 && headerCheckbox ? headerCheckbox : header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;