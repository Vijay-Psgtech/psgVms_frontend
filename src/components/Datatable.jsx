import { useState } from 'react';
import { Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,IconButton,TablePagination, Box, TextField  } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from "@mui/icons-material/Delete";

const DataTable = ({ columns, rows, onEdit, onDelete, rowsPerPageOptions=[10,15,25]}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]); 
    const [search, setSearch] = useState('');
    const filteredRows = (rows || []).filter((row)=>
        Object.values(row).some((value)=>
            value?.toString().toLowerCase().includes(search.toLowerCase())
        )
    );
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value,10));
        setPage(0);
    };
    return(
        <Box sx={{ p: 2, minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2}}>
                <TextField 
                    placeholder='Search...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                        maxWidth: 300,
                        backgroundColor: 'white',
                        borderRadius: 2,
                        boxShadow: 1,
                    }}
                />
            </Box>
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f0f4f8'}}>
                                {columns.map((col)=>(
                                    <TableCell key={col.field} sx={{ fontWeight: 'bold'}}>{col.headerName}</TableCell>
                                ))}
                                {(onEdit || onDelete) && <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRows.length > 0 ? (
                                filteredRows.slice(page*rowsPerPage, page*rowsPerPage+rowsPerPage).map((row, rowIndex)=>(
                                    <TableRow key={rowIndex}>
                                        {columns.map((col)=>(
                                            <TableCell key={col.field}>
                                                {row[col.field]}
                                            </TableCell>
                                        ))}
                                        {(onEdit || onDelete) && (
                                            <TableCell align='center'>
                                                {onEdit && (
                                                    <IconButton color="primary" onClick={()=>onEdit(row)} title='Edit'>
                                                        <EditIcon />
                                                    </IconButton>   
                                                )}
                                                {onDelete && (
                                                    <IconButton color='error' onClick={()=>onDelete(row.id || row._id)} title='Delete'>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 1} align='center'>
                                        No records found...
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
            </TableContainer>
            <TablePagination 
                component="div"
                count={filteredRows.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={rowsPerPageOptions}
            />
        </Box>
    );
};

export default DataTable