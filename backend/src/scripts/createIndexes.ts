// scripts/createIndexes.ts
import mongoose from 'mongoose';
import User from '../models/User';
import Problem from '../models/Problem';
import InterviewSession from '../models/InterviewSession';
import connectDB from '../config/database';

const createIndexes = async (): Promise<void> => {
  try {
    await connectDB();
    
    console.log('Creating indexes...');
    
    // User indexes
    await User.collection.createIndex({ "email": 1 }, { unique: true });
    await User.collection.createIndex({ "role": 1 });
    
    // Problem indexes
    await Problem.collection.createIndex({ "interview_type": 1 });
    await Problem.collection.createIndex({ "difficulty": 1 });
    await Problem.collection.createIndex({ "category_id": 1 });
    await Problem.collection.createIndex({ "popularity": -1 });
    await Problem.collection.createIndex({ "language_options": 1 });
    
    // InterviewSession indexes
    await InterviewSession.collection.createIndex({ "user_id": 1 });
    await InterviewSession.collection.createIndex({ "problem_id": 1 });
    await InterviewSession.collection.createIndex({ "status": 1 });
    await InterviewSession.collection.createIndex({ "start_time": -1 });
    await InterviewSession.collection.createIndex({ "user_id": 1, "status": 1 });
    
    console.log('Indexes created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
};

createIndexes();