document.addEventListener('DOMContentLoaded', () => {
  const deleteButtons = document.querySelectorAll('.delete-task');

  deleteButtons.forEach(button => {
    button.addEventListener('click', function() {
      const taskId = this.getAttribute('data-task-id');
      if (confirm('Are you sure you want to delete this task?')) {
        fetch(`/tasks/${taskId}`, {
          method: 'DELETE',
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok.');
          }
          return response.json();
        })
        .then(data => {
          console.log('Task deleted successfully:', data);
          window.location.reload();
        })
        .catch(error => {
          console.error('Error deleting task:', error);
        });
      }
    });
  });
});