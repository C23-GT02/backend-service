import DataTable from 'datatables.net';
import 'datatables.net-dt/css/jquery.dataTables.css'; // Import CSS untuk styling DataTables

// Pada bagian dalam file JavaScript Anda, gunakan DataTable seperti ini:
new DataTable('#myTables', {
  paging: false,
  scrollCollapse: true,
  scrollY: '200px',
});
