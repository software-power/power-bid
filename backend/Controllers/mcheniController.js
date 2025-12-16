const { getAllUsers } = require('../Models/usersModel');

// Display all users
const getUsers = async (req, res) => {
  req.userid
  try {
    const users = await getAllUsers();
    res.status(200).json({
      status: 'success',
      total: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
    });
  }
};


const sayHello=(req, res)=>{

    res.send("hello mcheni");
};

module.exports={sayHello,getUsers}