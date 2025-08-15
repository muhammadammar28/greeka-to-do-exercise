export const ResponseMessages = {
  TASK: {
    CREATE_SUCCESS: 'Task created successfully',
    UPDATE_SUCCESS: 'Task updated successfully',
    DELETE_SUCCESS: 'Task deleted successfully',
    DEACTIVATE_SUCCESS: 'Task deactivated successfully',
    FETCH_SUCCESS: 'Task retrieved successfully',
    FETCH_ALL_SUCCESS: 'Tasks retrieved successfully',
    NOT_FOUND: 'Task not found',
    ALREADY_EXISTS: 'Task already exists',
    INVALID_DATA: 'Invalid task data provided',
  },
  COMMON: {
    OPERATION_SUCCESS: 'Operation completed successfully',
    DATA_RETRIEVED: 'Data retrieved successfully',
    INVALID_REQUEST: 'Invalid request',
    SERVER_ERROR: 'An error occurred while processing your request',
  },
} as const;