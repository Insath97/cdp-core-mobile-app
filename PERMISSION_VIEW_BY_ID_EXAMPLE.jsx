// Example: How to use getPermissionById in a component

import { usePermission } from '../context/PermissionContext';

const PermissionDetailExample = () => {
    const { currentPermission, isLoading, error, getPermissionById } = usePermission();

    const handleViewPermission = async (permissionId) => {
        try {
            await getPermissionById(permissionId);
            // currentPermission will be updated with the fetched data
        } catch (err) {
            console.error('Failed to fetch permission:', err);
        }
    };

    return (
        <div>
            {/* Button to fetch a specific permission */}
            <button onClick={() => handleViewPermission(5)}>
                View Permission ID 5
            </button>

            {/* Display loading state */}
            {isLoading && <p>Loading permission details...</p>}

            {/* Display error if any */}
            {error && <p className="text-red-500">{error}</p>}

            {/* Display the fetched permission */}
            {currentPermission && (
                <div className="permission-details">
                    <h3>Permission Details</h3>
                    <p><strong>ID:</strong> {currentPermission.id}</p>
                    <p><strong>Name:</strong> {currentPermission.name}</p>
                    <p><strong>Group:</strong> {currentPermission.group_name}</p>
                    <p><strong>Guard:</strong> {currentPermission.guard_name}</p>
                    <p><strong>Created:</strong> {new Date(currentPermission.created_at).toLocaleDateString()}</p>
                    <p><strong>Updated:</strong> {new Date(currentPermission.updated_at).toLocaleDateString()}</p>
                </div>
            )}
        </div>
    );
};

export default PermissionDetailExample;
