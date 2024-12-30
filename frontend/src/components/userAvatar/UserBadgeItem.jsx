import { IconButton, Badge } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <Badge
      badgeContent={
        admin === user._id ? <span className="text-sm"> (Admin)</span> : null
      }
      color="primary"
      sx={{
        paddingX: 2,
        paddingY: 1,
        borderRadius: '12px',
        margin: '4px 8px',
        backgroundColor: '#9c27b0', // Purple color
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
      }}
      onClick={handleFunction}
    >
      <span className="text-sm">{user.name}</span>
      <IconButton
        sx={{
          paddingLeft: 1,
          color: 'white',
        }}
        onClick={handleFunction}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Badge>
  );
};

export default UserBadgeItem;
