//table.js

import * as React from 'react';
import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Box, Button, Divider, IconButton, InputBase, Stack, Typography } from '@mui/material';
import { AddCircle } from '@mui/icons-material';
import { Search as SearchIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { deletePatient, fetchPatientsData, addPatient } from '../store/feature/PatientSlicer';
import { useDispatch } from 'react-redux';
import ConfirmationDialog from './ConfirmationDialogs'; // Onay iletişim kutusu bileşeni
import Modal from '@mui/material/Modal';
import AddForm from './AddForm';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};




const PatientList = ({
    patients,
    columns,
    page,
    patientsPage,
    status,
    totalPatient,
    error,
    nextUrl,
    prevUrl,
    changePage,
    ChangePatients,
}) => {

    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [editedPatient, setEditedPatient] = useState(null);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [deletingPatientId, setDeletingPatientId] = useState(null);

    const handleOpenDeleteConfirmation = (patientId) => {
        setDeleteConfirmationOpen(true);
        setDeletingPatientId(patientId);
    };

    const handleCloseDeleteConfirmation = () => {
        setDeleteConfirmationOpen(false);
        setDeletingPatientId(null);
    };

    const handleConfirmDelete = () => {
        if (deletingPatientId) {
            handleDeletePatient(deletingPatientId);
            handleCloseDeleteConfirmation();
        }
    };
    const handleDeletePatient = (patientId) => {
        dispatch(deletePatient(patientId));
    };

    const handleSearch = () => {
        dispatch(fetchPatientsData({ type: 'search', searchTerm }));
    };

    const handleCreatePatient = (patientData) => {
        dispatch(addPatient(patientData));
        setOpen(false);
    };
    const handleEditClick = (patient) => {
        setEditedPatient(patient);
        setOpen(true);
    };


    return (
        <div>
            <div>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <AddForm
                            handleCreatePatient={handleCreatePatient}
                            id={editedPatient?.id}
                            editedPatient={editedPatient}
                        />
                    </Box>
                </Modal>
            </div>
            {status === 'loading' && <div>Loading...</div>}
            {status === 'failed' && <div>Error: {error}</div>}
            {status === 'succeeded' && (
                <Paper sx={{ width: '100%', overflow: 'hidden', padding: '20px' }}>
                    <Typography
                        gutterBottom
                        variant='h5'
                        component="div"
                        sx={{ padding: "20px" }}
                    >
                        Patient List
                    </Typography>
                    <Divider />
                    <Box height={10} />
                    <Stack direction={"row"} spacing={2}>
                        <InputBase
                            style={{ color: 'black', marginLeft: '20px', borderInlineColor: '#B1AFAF' }}

                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <IconButton onClick={handleSearch} sx={{ color: 'black' }}>
                            <SearchIcon />
                        </IconButton>
                        <Typography variant='h6' component={'div'} sx={{ flexGrow: 1 }}></Typography>
                        <Button onClick={handleOpen} color='grey' variant="contained" endIcon={<AddCircle />}>Add</Button>
                    </Stack>
                    <Box height={10} />
                    <TableContainer sx={{ maxHeight: 440 }}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            align={column.align}
                                            style={{ minWidth: column.minWidth }}
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                    <TableCell align='left' style={{ minWidth: "150px" }}>
                                        Action
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {patients
                                    .slice(page * patientsPage, page * patientsPage + patientsPage)
                                    .map((patient) => (
                                        <TableRow
                                            key={patient.id}
                                            style={{ borderRadius: '10px' }}
                                        >
                                            <TableCell>{patient.id || '-'}</TableCell>
                                            <TableCell>
                                                {`${patient.name?.[0]?.given?.[0] || ''} ${patient.name?.[0]?.family || ''} ${patient.name?.[0].text || ''
                                                    } `}
                                            </TableCell>
                                            <TableCell>{patient.gender || '-'}</TableCell>
                                            <TableCell>{patient.birthDate || '-'}</TableCell>
                                            <TableCell>
                                                {patient.telecom?.map((phone) => (
                                                    <div key={phone.value}>
                                                        <div>{phone.value}</div>
                                                        <div>{phone.use}</div>
                                                    </div>
                                                ))}
                                            </TableCell>
                                            <TableCell>
                                                {`${patient.address?.[0]?.line?.join(', ') || '-'},
                   ${patient.address?.[0]?.city || '-'},
                   ${patient.address?.[0]?.state || '-'},
                   ${patient.address?.[0]?.country || '-'}`}
                                            </TableCell>
                                            <TableCell align='left'>
                                                <Stack spacing={2} direction="row">
                                                    <IconButton
                                                        // onClick={() => handleEditClick(patient)}
                                                        sx={{ color: 'black', fontSize: '20px' }}>

                                                        <EditIcon onClick={() => handleEditClick(patient)} />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleOpenDeleteConfirmation(patient.id)}
                                                        sx={{ color: 'black', fontSize: '20px' }} // Customize icon color if needed
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 20]}
                        component="div"
                        count={totalPatient}
                        rowsPerPage={patientsPage}
                        page={page}
                        onPageChange={changePage}
                        onRowsPerPageChange={ChangePatients}
                        nextIconButtonProps={{
                            disabled: !nextUrl,
                        }}
                        backIconButtonProps={{
                            disabled: !prevUrl,
                        }}
                    />
                    <ConfirmationDialog
                        open={deleteConfirmationOpen}
                        onClose={handleCloseDeleteConfirmation}
                        onConfirm={handleConfirmDelete}
                        title="Confirm Delete"
                        message="Are you sure you want to delete this patient?"
                    />
                </Paper>
            )}

        </div>
    );
}
export default PatientList;
