const express = require('express'); 

const http = require('http');
// const { Server } = require('socket.io');

const socketIo = require('socket.io');

const {open}=require("sqlite")
const sqlite3=require("sqlite3") 

const {v4}=require("uuid")
const uuidv4=v4
const bcrypt=require('bcrypt')
const cors=require('cors')
const jwt=require("jsonwebtoken")

const app=express() 
const server = http.createServer(app);
//const io = new Server(server); 

const io = socketIo(server, {
    path: '/socket.io', // Make sure the same path is used on client-side
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'], // Prioritize websocket
});

app.use(express.json())


app.use(
    cors({
      origin: '*', // Update with your frontend origin
      methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
      allowedHeaders: ['Content-Type', 'Authorization'], // Include Authorization header
    })
  );
  app.options('*', cors()); // Handle preflight requests globally


const path=require('path')

const PORT =  process.env.PORT || 4000

const dbPath = path.join(__dirname, "projectDatabase.db");

let db = null; 

// WebSocket connections
const connectedClients = {}; // To track connected users by user ID

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('registerUser', (userId) => {
        connectedClients[userId] = socket.id; // Map userId to socket ID
        console.log(`User registered: ${userId} with socket ID: ${socket.id}`);
    });

    socket.on('disconnect', () => {
        for (const userId in connectedClients) {
            if (connectedClients[userId] === socket.id) {
                delete connectedClients[userId];
                break;
            }
        }
        console.log('A user disconnected');
    });
});

//----- web socket connection end -----


const initializeDBAndServer = async () => {
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });
      console.log("database is connected successfully!")
      
      server.listen(PORT, () => {
        console.log(`Server Running at ${PORT} PORT`);
    });
    } catch (e) {
      console.log(`DB Error: ${e.message}`);
      process.exit(1);
  
    }
  };
  initializeDBAndServer();



// Register API
app.post("/register/", async (req, res) => {
   
    
    const { username, password } = req.body;
    const id = uuidv4(); // Generate a unique user ID
  
    try {
        // Check if the user already exists
        const selectUserQuery = `SELECT * FROM users WHERE username = ?`;
        const dbUser = await db.get(selectUserQuery, [username]);
   
        if (dbUser) {
            return res.status(400).json({ errorMsg: "User already exists" });
        }
     
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 5);
       
        // Insert new user
        const createUserQuery = `
            INSERT INTO users (userId, username, password) 
            VALUES (?, ?, ?)
        `;
        const dbResponse = await db.run(createUserQuery, [id, username, hashedPassword]);
      
        const newUserId = dbResponse.lastID; // Get the inserted user ID
        res.status(201).json({ message: `Created new user with ID ${newUserId}` });

    } catch (err) {
        // Handle database or other errors
        res.status(500).json({ errorMsg: "An error occurred while creating the user", details: err.message });
    }
});


// Login API
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the user exists
        const selectUserQuery = `SELECT * FROM users WHERE username = ?`;
        const dbUser = await db.get(selectUserQuery, [username]);

        if (!dbUser) {
            return res.status(400).json({ errorMsg: "Invalid username" });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordMatched = await bcrypt.compare(password, dbUser.password);

        if (isPasswordMatched) {
            const { userId } = dbUser;

            // Generate JWT token
            const payload = {
                username,
                userId
            };
            
            const jwtToken = jwt.sign(payload, "usha@myap1s1" ); // Optional: Expiration time
            res.status(201).json({ userId, jwtToken });
        } else {
            res.status(400).json({ errorMsg: "Invalid password" });
        }
    } catch (err) {
        // Handle database errors or other unexpected errors
        res.status(500).json({ errorMsg: "An error occurred during login", details: err.message });
    }
});

// Middleware 
const authenticateToken = (request, response, next) => {
    try{ 
    let jwtToken;
    const authHeader = request.headers["authorization"] || request.headers['Authorization'];
    if (authHeader !== undefined) {
      jwtToken = authHeader.split(" ")[1];
     
    }
    if (jwtToken === undefined) {
      
      response.status(401).json({error_msg:"Invalid JWT Token"});
    } else {
      jwt.verify(jwtToken, "usha@myap1s1", async (error, payload) => {
        if (error) {
          response.status(400).json({errorMsg:"Invalid JWT Token"});
        } else {
         
          request.payload=payload
          next();
  
        }
      });
    }
}catch(err){
     console.log(`invalid token :${err}`)
}
  };

// GETTing user profile data 

app.get("/user-profile",authenticateToken ,async(request,response)=>{
        try { 
                const {userId}=request.payload

                const dbUserQuery=`
                SELECT * FROM users where userId=?`
                const userDetails=await db.get(dbUserQuery ,[userId])
                response.status(201).json({username:userDetails.username})
        } catch (err) {
            console.error(err);
            res.status(500).json({ errorMsg: 'Database error' });
        }
})

//ADD properties Api 

app.post("/properties",async(request, response)=>{
    try{
        const {propertyTitle , price, description, ownerId}=request.body 
        const propertyId=uuidv4(); 
        const insertPropertyQuery=
        `INSERT INTO properties (propertyId, propertyTitle,price,description,ownerId) VALUES
        (?, ?,?,? ,?)`;

        await db.run(insertPropertyQuery,[propertyId, propertyTitle,price, description, ownerId])

        const property = { propertyId, propertyTitle , price, description, ownerId};
        io.emit('newProperty', property); // Broadcast to all connected clients

        response.status(201).json({message:"Property added successfully"})
    }catch (err) {
            console.error(err);
            response.status(500).json({ errorMsg: "Internal Server Error" });
        }
    
    })

// Getting Properties API 

app.get("/properties",authenticateToken ,async(request, response)=>{
    try{
        const {userId}=request.payload
        const getPropertiesQuery=`
        SELECT properties.*  ,chats.status
        from properties LEFT JOIN chats ON chats.propertyId=properties.propertyId AND chats.userId=?;`

        const propertiesArray=await db.all(getPropertiesQuery,[userId])
        response.status(201).json(propertiesArray)
    
    }catch (err) {
            console.error(err);
            response.status(500).json({ errorMsg: "Internal Server Error" });
        }
    
    })
 
// chat request API

  app.post('/chat-request',authenticateToken , async (req, res) => {
    const { propertyId } = req.body;

    try {
      
        const {userId}=req.payload
      
        // Retrieve the property owner safely
        const getPropertyOwnerQuery = `SELECT ownerId FROM properties WHERE propertyId = ?;`;
        const response = await db.get(getPropertyOwnerQuery, [propertyId]);
        

        const { ownerId } = response;
        const chatId=uuidv4()
       

        // Insert the chat request
        const insertChatQuery = `
            INSERT INTO chats (chatId, propertyId, userId, ownerId, status)
            VALUES (?, ?, ?, ?, 'pending');`;

        await db.run(insertChatQuery, [chatId, propertyId, userId, ownerId]);
         
        // get new chat request property name and username

        const getChatRequestUsernameAndPropertyQuery= `
        SELECT properties.propertyId,chats.chatId,chats.status,users.username, properties.propertyTitle 
        FROM chats 
        JOIN properties ON chats.propertyId = properties.propertyId 
        JOIN users ON chats.userId = users.userId 
        WHERE chats.chatId = ?
        `
       const newChatRequestDetails= await db.get(getChatRequestUsernameAndPropertyQuery,[chatId])


      

        //-----real time chat request update
        const { username,propertyTitle,status}=newChatRequestDetails

       const newChatRequest = {
            chatId,username,propertyTitle,status
        };

        // Notify the owner in real-time
       console.log(`connected clients : ${connectedClients}`)
       console.log(connectedClients)
        const ownerSocketId = connectedClients[ownerId];
        console.log(`broadcast /targeted owner id : ${ownerId} socket id : ${connectedClients[ownerId]}`)
        if (ownerSocketId) {
            io.to(ownerSocketId).emit('newChatRequest', newChatRequest);
        }

        //----------

        // Success response
        res.status(201).json({ newChatRequestDetails, message: 'Chat request sent' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ errorMsg: 'Database error' });
    }
});

// GET ALL chat Requests for Api 
app.get("/get-chat-requests",authenticateToken, async(request,response)=>{
    try{ 
        const {userId}=request.payload 
    const getAllChatRequestsQuery=`
    SELECT chats.chatId,chats.status,users.username, properties.propertyTitle 
    FROM chats 
    JOIN properties ON chats.propertyId = properties.propertyId 
    JOIN users ON chats.userId = users.userId 
    WHERE chats.ownerId = ?`;

    const chatRequests=await db.all(getAllChatRequestsQuery, [userId]);

    
    
    response.status(201).json(chatRequests);


    }catch (err) {
        console.error(err);
       response.status(500).json({ errorMsg: err });
    }
});

// updating STATUS Of CHAT Request 
app.put("/update-chat-status",authenticateToken,async(request, response)=>{
    try{ 
    const {chatId, statusText }=request.body //accept or rejected status 

    const updateChatStatusQuery = `
            UPDATE chats
            SET status = ?
            WHERE chatId = ?;
        `;

        const result = await db.run(updateChatStatusQuery, [statusText, chatId]);
      
        response.status(201).json({ chatId,status:statusText,message: "Chat status updated successfully" });
    } catch (err) {
        console.error(err);
        response.status(500).json({ errorMsg: "Internal Server Error",err });
    }

})

// send chat message API 

app.post("/send-chat-message",async(request, response)=>{
    try{
        const {messageId,userId, chatId , content}=request.body;

        const getStatusOfChatQuery=`
        SELECT status from chats where chatId=?`

        const {status}=await db.get(getStatusOfChatQuery, [chatId])
        console.log(status )

        // checking status 
        if(status=="Accepted"){

            const currentTime = new Date().toLocaleString("en-US", {
                timeZone: "Asia/Kolkata", // India Standard Time (IST)
            });

            const insertMessageQuery=`
            INSERT into messages (messageId , chatId , senderId,content,timestamp) VALUES( ? ,?,?,?, ?);`

            await db.run(insertMessageQuery, [messageId ,chatId,userId,content , currentTime]);
            response.status(201).json({ message: "message sent successfully" });

        }else{
            response.status(400).json({ errorMsg: "user can't send message as status is not accepted" });
        }


    }catch (err) {
            console.error(err);
            response.status(500).json({ errorMsg: "Internal Server Error" });
        }
    
    })


    app.get("/get-chat-messages",async(request, response)=>{
        try{
            const {chatId}=request.body
            const getAllChatMessagesQuery=`
            select * from messages where chatId=? order by timestamp ASC;`

            const chatMessages=await db.all(getAllChatMessagesQuery , [chatId])
            response.status(201).json( chatMessages );
        
        }catch (err) {
                console.error(err);
                response.status(500).json({ errorMsg: "Internal Server Error" });
            }
        
        })

/*app.put("",async(request, response)=>{
try{

}catch (err) {
        console.error(err);
        response.status(500).json({ error: "Internal Server Error" });
    }

})*/
