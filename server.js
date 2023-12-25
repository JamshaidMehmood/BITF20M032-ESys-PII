const express = require('express');
const app = express();
const {stdInterest,stdActivity,User} = require('./models/model');
const mongoose = require('mongoose');
require('dotenv').config();

// middleware to parse JSON requests
app.use(express.json());

// middleware to parse form data
app.use(express.urlencoded({ extended: true }));

const HTTP_PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

// middleware to manage user sessions
const session = require('express-session');
app.use(session({
  secret: 'jamshaidmehmoodahmadisboyofitandisworkinghardforESproject',
  resave: false,
  saveUninitialized: false,
}));

app.get('/', (req, res) => {
  res.render('home'); 
});

// Signup route
app.get('/signup', (req, res) => {
  res.render('signup'); 
});

app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const newUser = new User({ username, password });
    await newUser.save();
    const newActivity = new stdActivity({ activityType :'Signed Up '});
    await newActivity.save();
    req.session.user = newUser; 
    res.redirect('/login'); 
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    const newActivity = new stdActivity({ activityType: 'Logged In ' });
    await newActivity.save();
    console.log("-------------------");

    if (user) {
      req.session.user = user;
      console.log(req.session.user)
      req.session.isAuthenticated = true;

      res.render('Form', { authenticated: req.session.isAuthenticated });
    } else {
      res.redirect('/signup');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Internal Server Error');
  }
});

// logout route
app.get('/logout', async(req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
      if (err) {
          console.error('Error destroying session:', err);
          res.status(500).send('Internal Server Error');
      } else {
          // Redirect to the home page or login page after logout
          res.redirect('/');
      }
  });
});

app.get('/form',  (req, res) => {
  res.render('Form',{authenticated: req.session.isAuthenticated});
});

app.get('/api/interests', async (req, res) => {
  try {
    const distinctInterests = await stdInterest.distinct('interest');
    const newActivity = new stdActivity({ activityType :'interest page visited '});
    await newActivity.save();
    res.json(distinctInterests);

  } catch (error) {
    console.error('Error fetching interests:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/addStudent', async (req, res) => {
  try {
    console.log(req.body)
     // Add a default value for interest if not present in the request
     if (!req.body.interest) {
      req.body.interest = req.body.newInterest;
    }

    const newStudentInterest = new stdInterest(req.body);
    await newStudentInterest.save();
    const newActivity = new stdActivity({ activityType :'student added '});
    await newActivity.save();
    const students = await stdInterest.find();
    // Pass the student data to the template
    res.render('StudentList', { students , authenticated: req.session.isAuthenticated, user:req.session.user });
  } catch (error) {
    console.error('Error adding interest:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.route('/api/interests')
  .get(async (req, res) => {
    try {
      const distinctInterests = await stdInterest.distinct('interest');
      const newActivity = new stdActivity({ activityType :'interest page visited '});
      await newActivity.save();
      res.json(distinctInterests);
    } catch (error) {
      console.error('Error fetching interests:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .post(async (req, res) => {
    try {
      const { interest } = req.body;

      // Check if the interest already exists
      const existingInterest = await stdInterest.findOne({ interest });

      if (!existingInterest) {
        // If the interest doesn't exist, save it
        const newInterest = new stdInterest({ interest });
        await newInterest.save();
      }

      // Return the updated list of interests
      const updatedInterests = await stdInterest.distinct('interest');
      const newActivity = new stdActivity({ activityType :'new interest added '});
      await newActivity.save();
      res.json(updatedInterests);
    } catch (error) {
      console.error('Error adding interest:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/studentList', async (req, res) => {
    try {
        let pageSize = parseInt(req.query.pageSize) || 10;
        let pageNumber = parseInt(req.query.pageNumber) || 1;

        // Get the total students with interest
        const students = await stdInterest.find();
        const newActivity = new stdActivity({ activityType :'Student List page visited'});
        await newActivity.save();
        console.log(students.length);
        console.log("here" );
        console.log("``````````````````````````````````````````````````````````");
        res.render('StudentList', {students, authenticated: req.session.isAuthenticated,
                user: req.session.user
            });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

  // for deleting the student
  app.get('/deleteStudent/:id', async (req, res) => {
    try {
      const studentId = req.params.id;
  
      // Perform the deletion in the database
      await stdInterest.findByIdAndDelete(studentId);
      const newActivity = new stdActivity({ activityType :'student Deleted'});
      await newActivity.save();
      const students= await stdInterest.find();
      res.render('studentList', { students, authenticated: req.session.isAuthenticated,user:req.session.user });
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).send('Internal Server Error');
    }
});

// View student details
app.get('/viewStudent/:id', async (req, res) => {
  try {
      const student = await stdInterest.findById(req.params.id);
      const newActivity = new stdActivity({ activityType :'Student Viewed'});
      await newActivity.save();
      res.render('viewStudent', { student });

  } catch (error) {
      console.error('Error viewing student:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/editStudent/:id', async (req, res) => {
  try {
      const student = await stdInterest.findById(req.params.id);
      const newActivity = new stdActivity({ activityType :'Student Edited'});
      await newActivity.save();
      res.render('editForm', { student, authenticated: req.session.isAuthenticated });

  } catch (error) {
      console.error('Error viewing student:', error);
      res.status(500).send('Internal Server Error');
  }
});

// Update student details
app.post('/updateStudent/:id', async (req, res) => {
  try {
      const studentId = req.params.id;

      const student = await stdInterest.findById(studentId);

      if (!student) {
          return res.status(404).send('Student not found');
      }

      // Update student fields based on the request body
      await stdInterest.updateOne({ _id: studentId }, { $set: req.body });

      const newActivity = new stdActivity({ activityType: 'student updated' });
      await newActivity.save();
      const students = await stdInterest.find();

      res.render('studentList', { students, authenticated: req.session.isAuthenticated,user:req.session.user });
  } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).send('Internal Server Error');
  }
});



// for dash board 
app.get('/studentDashboard', async (req, res) => {
  try {
    const newActivity = new stdActivity({ activityType :'Dashboard visited '});
    await newActivity.save();
    // Fetch data for dashboard widgets
    const topInterests = await getTopInterests();
    const bottomInterests = await getBottomInterests();
    const distinctInterestsCount = await getDistinctInterestsCount();
    const provincialData = await getProvincialDistribution();
    const submissionChartData = await getSubmissionChartData();
    const ageDistributionData = await getAgeDistributionData();
    const departmentDistribution = await getDepartmentDistribution();
    const degreeDistribution = await getDegreeDistribution();
    const genderDistribution = await getGenderDistribution();
    const last30DaysActivity = await getLast30DaysActivity();
    const last24HoursActivity = await getLast24HoursActivity();
    const studentsStatusGrid = await calculateStudentsStatusGrid();
    const mostActiveHours = await getMostActiveHours();
    const leastActiveHours = await getLeastActiveHours();
    const deadHours = await getDeadHours();

    // Render the dashboard with data
    res.render('dashboard', {
      topInterests,
      bottomInterests,
      distinctInterestsCount,
      provincialData,
      submissionChartData,
      ageDistributionData,
      departmentDistribution,
      degreeDistribution,
      genderDistribution,
      last30DaysActivity,
      last24HoursActivity,
      studentsStatusGrid,
      mostActiveHours,
      leastActiveHours,
      deadHours,
      authenticated: req.session.isAuthenticated
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).render('error', { error });
  }
});

// Helper functions to fetch data for dashboard widgets
async function getTopInterests() {
  try {
    const topInterests = await stdInterest.aggregate([
      { $group: { _id: "$interest", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    
    // Extract only the interest values from the result
    const topInterestValues = topInterests.map((interest) => interest._id);

    return topInterestValues;
  } catch (error) {
    console.error('Error fetching top interests:', error);
    throw error; // You can handle errors as needed in your application
  }
}

async function getBottomInterests() {
  return ['Interest6', 'Interest7', 'Interest8', 'Interest9', 'Interest10'];
}
  
// Assuming 'stdInterest' is your mongoose model

async function getBottomInterests() {
  try {
    // Replace this with the actual logic to fetch bottom interests
    // from your MongoDB database using your 'stdInterest' model
    const bottomInterests = await stdInterest.aggregate([
      { $group: { _id: "$interest", count: { $sum: 1 } } },
      { $sort: { count: 1 } }, // Sort in ascending order to get bottom interests
      { $limit: 5 },
    ]);

    // Extract only the interest values from the result
    const bottomInterestValues = bottomInterests.map((interest) => interest._id);

    return bottomInterestValues;
  } catch (error) {
    console.error('Error fetching bottom interests:', error);
    throw error; // You can handle errors as needed in your application
  }
}

async function getDistinctInterestsCount() {
  try {
    const distinctInterests = await stdInterest.distinct('interest');
    const distinctInterestsCount = distinctInterests.length;
    console.log(distinctInterestsCount);
    return distinctInterestsCount;
  } catch (error) {
    console.error('Error fetching distinct interests count:', error);
    throw error;
  }
}

async function getProvincialDistribution() {
  try {
    // Fetch relevant data from the database to determine provinces
    const studentData = await stdInterest.find({}, { city: 1 });

    // city to province mapping
    const cityProvinceMapping = {
      'Karachi': 'Sindh',
      'Lahore': 'Punjab',
      'Multan': 'Punjab',
      'Peshawar': 'Khyber Pakhtunkhwa',
      'DI Khan': 'Punjab',
      'Bhakar': 'Punjab',
    };

    // Calculate province counts
    const provinceCounts = {};
    studentData.forEach(student => {
      const city = student.city;
      const province = cityProvinceMapping[city] || 'Unknown';
      provinceCounts[province] = (provinceCounts[province] || 0) + 1;
    });

    // Format the data for the pie chart
    const formattedData = Object.entries(provinceCounts).map(([label, value]) => ({
      label: label,
      value: value,
    }));

    console.log('Provincial Distribution Data:', formattedData);

    return formattedData;
  } catch (error) {
    console.error('Error calculating provincial distribution data:', error);
    throw error; 
  }
}



async function getSubmissionChartData() {
  try {
    const submissionChartData = await stdInterest.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $limit: 30, 
      },
    ]);

    const formattedData = submissionChartData.map((entry) => ({
      date: entry._id,
      count: entry.count,
    }));
  
    console.log("Submission Data " , formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error fetching submission chart data:', error);
    throw error; 
  }
}

async function getAgeDistributionData() {
  try {
    const ageDistributionData = await stdInterest.aggregate([
      {
        $addFields: {
          dob: {
            $cond: {
              if: { $eq: [{ $type: '$dob' }, 'string'] },
              then: { $toDate: '$dob' },
              else: '$dob',
            },
          },
        },
      },
      {
        $project: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dob'] },
                31557600000, // milliseconds in a year (1000 ms * 60 s * 60 min * 24 hours * 365 days)
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: '$age',
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const formattedData = ageDistributionData.map((entry) => ({
      age: entry._id,
      count: entry.count,
    }));
 
    //console.log("Age distribution data " , formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error fetching age distribution data:', error);
    throw error;
  }
}

async function getDepartmentDistribution() {
  try {
    const departmentDistributionData = await stdInterest.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the data for the pie chart
    const formattedData = departmentDistributionData.map((entry) => ({
      label: entry._id || 'Unknown',
      value: entry.count,
    }));
    
    //console.log("DEpartmental Distribution ", formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error fetching department distribution data:', error);
    throw error; 
  }
}

async function getDegreeDistribution() {
  try {
    const degreeDistributionData = await stdInterest.aggregate([
      {
        $group: {
          _id: '$degree',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the data for the pie chart
    const formattedData = degreeDistributionData.map((entry) => ({
      label: entry._id || 'Unknown',
      value: entry.count,
    }));
    
    console.log("Degree Distribution ", formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error fetching degree distribution data:', error);
    throw error; 
  }
}

async function getGenderDistribution() {
  try {
    const genderDistributionData = await stdInterest.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the data for the pie chart
    const formattedData = genderDistributionData.map((entry) => ({
      gender: entry._id,
      count: entry.count,
    }));

    return formattedData;
  } catch (error) {
    console.error('Error fetching gender distribution data:', error);
    throw error;
  }
}

async function getLast30DaysActivity() {
  try {
    const last30DaysActivityData = await stdActivity.aggregate([
      {
        $match: {

          visitedAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitedAt' } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    // Format the data for the line chart
    const formattedData = last30DaysActivityData.map((entry) => ({
      date: entry._id,
      count: entry.count,
    }));

    console.log("30 day log ", formattedData)
    return formattedData;
  } catch (error) {
    console.error('Error fetching last 30 days activity data:', error);
    throw error; 
  }
}


async function getLast24HoursActivity() {
  try {
    const last24HoursActivityData = await stdActivity.aggregate([
      {
        $match: {
          visitedAt: {
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d %H:%M', date: '$visitedAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    // Format the data for the line chart
    const formattedData = last24HoursActivityData.map((entry) => ({
      date: entry._id,
      count: entry.count,
    }));

    return formattedData;
  } catch (error) {
    console.error('Error fetching last 24 hours activity data:', error);
    throw error; 
  }
}

async function calculateStudentsStatusGrid() {
  try {
    // Define the duration of each degree in years
    const degreeDurations = {
      'Bachelors Degree': 4,
      'M.Phil. Degree': 2,
      'Post-Graduate Diploma': 3,
      'Associate Degree': 2,
      'Doctorate': 5,
      'Post-Doctorate': 2,
      'PhD': 5,
    };

    // Fetch all students
    const allStudents = await stdInterest.find();

    // Calculate status based on start date, end date, and degree duration
    const studentsStatusData = allStudents.map(student => {
      const { startDate, endDate, degree } = student;
      const degreeDuration = degreeDurations[degree];

      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      if (startDateObj > new Date()) {
        return 'Recently Enrolled';
      }

      if (endDateObj < new Date()) {
        return 'Graduated';
      }

      const expectedGraduationDate = new Date(startDateObj);
      expectedGraduationDate.setFullYear(expectedGraduationDate.getFullYear() + degreeDuration);

      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      if (
        expectedGraduationDate >= new Date() &&
        expectedGraduationDate <= thirtyDaysFromNow
      ) {
        return 'About to Graduate';
      }

      // if no case match
      return 'Currently Studying';
    });

    // Count the occurrences of each status
    const statusCounts = studentsStatusData.reduce((counts, status) => {
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});

    console.log('Status count is as ', statusCounts);
    return statusCounts;
  } catch (error) {
    console.error('Error calculating students status grid:', error);
    throw error;
  }
}

async function getMostActiveHours() {
  try {
    const mostActiveHoursData = await stdActivity.aggregate([
      {
        $group: {
          _id: { $hour: { $toDate: '$visitedAt' } }, 
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    // Format the data for the most active hours list
    const formattedData = mostActiveHoursData.map((entry) => ({
      hour: entry._id,
      count: entry.count,
    }));

    console.log("Displaying most active hours " , formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error fetching most active hours data:', error);
    throw error;
  }
}

async function getLeastActiveHours() {
  try {
     const leastActiveHoursData = await stdActivity.aggregate([
      {
        $group: {
          _id: { $hour: '$visitedAt' }, 
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: 1 }, 
      },
      {
        $limit: 5, 
      },
    ]);

    // Format the data for the least active hours list
    const formattedData = leastActiveHoursData.map((entry) => ({
      hour: entry._id,
      count: entry.count,
    }));

    console.log("Displaying least active hours " , formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error fetching least active hours data:', error);
    throw error;
  }
}


async function getDeadHours() {
  try {
    const thirtyDaysAgo = new Date(); // Current date and time
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // Subtract 30 days

    const deadHoursData = await stdActivity.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }, // Filter data from the last 30 days
        },
      },
      {
        $group: {
          _id: { $hour: '$visitedAt' }, 
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: 1 }, 
      },
      {
        $limit: 5, 
      },
    ]);

    // Format the data for the dead hours list
    const formattedData = deadHoursData.map((entry) => ({
      hour: entry._id,
      count: entry.count,
    }));

    console.log("Dead hours", formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error fetching dead hours data:', error);
    throw error;
  }
}
//-----------------------------------------------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(HTTP_PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
      console.log(`Press CTRL + C to exit`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
