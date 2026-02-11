'use client';

export default function Table({ columns, data, onRowClick, actions }) {
    return (
        <div className="table-container fade-in">
            <table className="table">
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} style={{ width: col.width }}>{col.header}</th>
                        ))}
                        {actions && <th style={{ width: '60px' }}></th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={row.id || rowIndex}
                            onClick={() => onRowClick && onRowClick(row)}
                            style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                        >
                            {columns.map((col, colIndex) => (
                                <td key={colIndex}>
                                    {col.render ? col.render(row) : row[col.accessor]}
                                </td>
                            ))}
                            {actions && (
                                <td onClick={(e) => e.stopPropagation()}>
                                    {actions(row)}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {data.length === 0 && (
                <div style={{
                    padding: '48px',
                    textAlign: 'center',
                    color: 'var(--text-muted)'
                }}>
                    No data available
                </div>
            )}
        </div>
    );
}
