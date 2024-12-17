import { Avatar, Box, Typography } from '@mui/material';

const UserListItem = ({ handleFunction, user }) => {
  return (
    <Box
      onClick={handleFunction}
      sx={{
        cursor: 'pointer',
        backgroundColor: '#E8E8E8',
        '&:hover': {
          backgroundColor: '#38B2AC',
          color: 'white',
        },
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        color: 'black',
        paddingX: 2,
        paddingY: 1,
        marginBottom: 2,
        borderRadius: '8px',
      }}
    >
      <Avatar
        sx={{
          marginRight: 2,
          cursor: 'pointer',
          width: 24,
          height: 24,
        }}
        alt={user.name}
        src={user.pic}
      />
      <Box>
        <Typography>{user.name}</Typography>
        <Typography variant="body2" fontSize="small">
          <b>Email: </b>{user.email}
        </Typography>
      </Box>
    </Box>
  );
};

export default UserListItem;
