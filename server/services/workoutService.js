const db = require('./db');

const getWorkouts = (userId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT day, exercises FROM workouts WHERE userId = ?', [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const updateWorkouts = (userId, plans) => {
  return new Promise((resolve, reject) => {
    // Delete existing plans
    db.query('DELETE FROM workouts WHERE userId = ?', [userId], (err) => {
      if (err) return reject(err);
      // Insert new plans
      if (plans.length === 0) return resolve();
      const values = plans.map(plan => [userId, plan.day, plan.exercises]);
      db.query('INSERT INTO workouts (userId, day, exercises) VALUES ?', [values], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

const getWorkoutPlan = (goal) => {
  const plans = {
    'Weight Loss': [
      { day: 'Monday', exercises: 'Cardio 30 min, Squats 3x10, Planks 3x30s' },
      { day: 'Tuesday', exercises: 'Yoga 45 min, Lunges 3x10 per leg' },
      { day: 'Wednesday', exercises: 'Running 20 min, Burpees 3x10' },
      { day: 'Thursday', exercises: 'Cycling 30 min, Push-ups 3x10' },
      { day: 'Friday', exercises: 'HIIT 20 min, Squats 3x12' },
      { day: 'Saturday', exercises: 'Swimming 30 min or brisk walk' },
      { day: 'Sunday', exercises: 'Rest or light yoga' }
    ],
    'Muscle Gain': [
      { day: 'Monday', exercises: 'Bench Press 3x8, Deadlifts 3x6, Bicep Curls 3x10' },
      { day: 'Tuesday', exercises: 'Pull-ups 3x10, Shoulder Press 3x8, Tricep Dips 3x12' },
      { day: 'Wednesday', exercises: 'Squats 3x8, Leg Press 3x10, Calf Raises 3x15' },
      { day: 'Thursday', exercises: 'Incline Bench 3x8, Rows 3x10, Hammer Curls 3x12' },
      { day: 'Friday', exercises: 'Deadlifts 3x6, Overhead Press 3x8, Lateral Raises 3x12' },
      { day: 'Saturday', exercises: 'Squats 3x10, Pull-ups 3x8, Push-ups 3x15' },
      { day: 'Sunday', exercises: 'Rest' }
    ],
    'General Fitness': [
      { day: 'Monday', exercises: 'Full body: Push-ups 3x10, Squats 3x15, Planks 3x45s' },
      { day: 'Tuesday', exercises: 'Cardio: Running 20 min, Jumping Jacks 3x50' },
      { day: 'Wednesday', exercises: 'Strength: Dumbbell Rows 3x10, Lunges 3x10 per leg' },
      { day: 'Thursday', exercises: 'Core: Crunches 3x20, Russian Twists 3x20' },
      { day: 'Friday', exercises: 'Mixed: Burpees 3x10, Mountain Climbers 3x30s' },
      { day: 'Saturday', exercises: 'Active Rest: Yoga or light walk' },
      { day: 'Sunday', exercises: 'Rest' }
    ]
  };
  return plans[goal] || plans['General Fitness'];
};

module.exports = { getWorkouts, updateWorkouts, getWorkoutPlan };