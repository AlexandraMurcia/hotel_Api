const express = require('express');
const bodyParser = require('body-parser');
const habitacionesRoutes = require('./Routes/habitacionesRoutes');
const reservacionesRoutes = require('./Routes/reservacionesRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(habitacionesRoutes);
app.use(reservacionesRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});