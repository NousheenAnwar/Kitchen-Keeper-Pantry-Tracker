
'use client'
import { AutoScroll } from '@fluentui/react'
import { useState, useEffect } from 'react'
import { firestore } from '@/firebase'
import { Box, Stack, Typography, Button, Modal, TextField, createTheme, ThemeProvider, ButtonGroup, Container, overflow } from '@mui/material'
import{
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
  writeBatch,
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}
const muitheme = createTheme({
  typography: {
    fontFamily: 'Rubik',
  },
  palette: {
    primary: {
      main: '#004d42',
    },
    secondary: {
      main: '#e8f5e9',
    }}
  })

export default function Home() {

  
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [editOpen, setEditOpen] = useState(false);
  const [newQuantity, setNewQuantity] = useState('');
  const [ItemToEdit, setItemToEdit] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleEditClick = () => {
    editItem(ItemToEdit, itemName, newQuantity);
    setNewQuantity('');
    setItemName('');
    setItemToEdit('');
    setEditOpen(false);
  };

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
        setInventory(inventoryList)
  }
  useEffect(() => {
       updateInventory()
  }, [])
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }
  
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const editItem = async (ItemToEdit, itemName, newQuantity) => {
    
      // Check if oldItemName or newItemName is empty
  if (!ItemToEdit || !itemName) {
    console.error("Item name cannot be empty");
    return;
  }
    const oldDocRef = doc(collection(firestore, 'inventory'), ItemToEdit);
    const newDocRef = doc(collection(firestore, 'inventory'), itemName);
  
    try {
      // Start a batch write
      const batch = writeBatch(firestore);
  
      // Get the old document
      const oldDocSnap = await getDoc(oldDocRef);
  
      if (oldDocSnap.exists()) {
        
        // If the item name has changed
        if (ItemToEdit !== itemName) {
          
          // Delete the old document
          batch.delete(oldDocRef);
          
          // Create a new document with the new name
          batch.set(newDocRef, { 
            quantity: parseInt(newQuantity),
            // Copy any other fields from the old document
            ...oldDocSnap.data()
          });
        } else {
          
          // If only quantity has changed, update the existing document
          batch.update(oldDocRef, { quantity: parseInt(newQuantity) });
        }
  
        // Commit the batch
        await batch.commit();
        
      } else {
        console.error("Document does not exist!");
      }
  
      // Update the inventory state
      await updateInventory();
      
    } catch (error) {
      console.error("Error editing item: ", error);
    }
  };
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

return (
  
  <ThemeProvider theme={muitheme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
        gap={2}
        sx={{
          backgroundImage: 'url(/Image1.jpg)', // Add your background image path here
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          maxWidth: 'false',
          maxHeight: 'false',
          padding: '2',
        }}>
          
          <Box
          width="auto"
          height="auto"
          display="flex"
          justifyContent="space-between"
          flexDirection="column"
          alignItems="center"
          gap={2}
          padding={2}
          sx={{
            bgcolor: '#daf6f6',
            borderRadius: '20px',
            padding: '10px',
            mt:'5',
          }}
          >
          <Typography variant="h1" color="#004d42" >
            Kitchen Keeper</Typography>

            
        </Box>
        <Box 
            display="flex"
            flexDirection="row" 
            alignItems="center" 
            mb={2} 
            
            width= "auto" 
            height="auto"
            sx={{
              bgcolor: '#daf6f6',
              borderRadius: '20px',
              padding: '10px',
              mt:'2',
            }}
            >
            <Typography variant='h5' color='#004d42'>Keep track of your Kitchen items</Typography>
            </Box>
        <Modal
    open={open}
    onClose={handleClose}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
  >
    <Box sx={style}>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        Add Item
      </Typography>
      <Stack width="100%" direction={'row'} spacing={2}>
        <TextField
          id="outlined-basic"
          label="Item"
          variant="outlined"
          fullWidth
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <Button
          variant="contained"
          color='primary'
          onClick={() => {
            addItem(itemName)
            setItemName('')
            handleClose()
          }}
        >
          Add
        </Button>
      </Stack>
    </Box>
  </Modal>
        <Button variant="contained" onClick={handleOpen} justifyContent="flex-end">
    Create New Item
  </Button>
  <Modal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          aria-labelledby="edit-modal-title"
          aria-describedby="edit-modal-description"
        >
          <Box sx={style}>
            <Typography id="edit-modal-title" variant="h6" component="h2">
              Edit Item
            </Typography>
            <Stack width="100%" direction="column" spacing={2}>
              
              <TextField
                id="name-input"
                label="Update Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                type="string"
              />
              <TextField
                id="quantity-input"
                label="Update Quantity"
                variant="outlined"
                fullWidth
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                type="number"
              />
          <Button variant="contained" onClick={handleEditClick} size='small' color='primary'>
  Edit
</Button>
            </Stack>
          </Box>
        </Modal>

  <Box borderRadius={10}
  border="1px solid #004d42"
  width="80vw"
  height='90vh'
  maxWidth="false"
  bgcolor="#a3e8e7"
  p={2}
  >
    <Typography variant={'h3'} color={'#163a3a'} textAlign={'center'}>
        Kitchen Items
      </Typography>
    <Box
      width="auto"
      height="auto"
      display="flex"
      justifyContent={'center'}
      alignItems={'center'}
      borderRadius={10}
    >
      

  <TextField
    variant="outlined"
    size="small"
    placeholder="Search items..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    flexDirection='column'
    sx={{ mr: 1, width: 'auto', color:'#163a3a' }}
  />
  <Button 
    variant="contained" 
    onClick={() => setSearchQuery('')}
    sx={{ size: 'small' }}
  >
    Clear
  </Button>
  </Box>
  <Box>
    <Stack width="auto" height="300px" spacing={2} overflow={'auto'} padding={2} flexDirection={'column'}>
      {filteredInventory.map(({name, quantity}) => (
        <Box
          key={name}
          width="100%"
          minHeight="50px"
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          bgcolor={'#b6ebee'}
          paddingX={5}
          borderRadius={10}
        >
          <Typography variant={'h5'} color={'#163a3a'} textAlign={'center'}>
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Typography>
          
          <Typography variant={'h5'} color={'#163a3a'} textAlign={'center'}>
            Quantity: {quantity}
          </Typography>
          <ButtonGroup variant="contained" aria-label="Basic button group">
          <Button variant="contained" onClick={() => {
  setItemToEdit(name);
  setItemName(name);
  setNewQuantity(quantity.toString());
  setEditOpen(true);
}} size='small' justifyContent='flex-end'>Edit</Button>
          <Button variant="contained" onClick={() => removeItem(name)} size='small' justifyContent='flex-end
          '>
            Remove
          </Button>
          </ButtonGroup>
        </Box>
      ))}
    </Stack>
    </Box>
  </Box>
          </Box>
          


</ThemeProvider>
)
}
