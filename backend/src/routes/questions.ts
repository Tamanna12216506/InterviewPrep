import express from 'express';
import Question from '../models/Question';
import Performance from '../models/Performance';
import { authenticateToken } from '../middleware/auth';
import { GeminiService } from '../services/geminiService';
const router = express.Router();

// Get random question
router.get('/random', async (req, res) => {
  try {
    const count = await Question.countDocuments();
    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne().skip(random);
    
    if (!question) {
      return res.status(404).json({ message: 'No questions found' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get questions by topic
router.get('/topic/:topic', authenticateToken, async (req, res) => {
  try {
    const { topic } = req.params;
    const { difficulty, page = 1, limit = 10 } = req.query;
    
    const filter: any = { topic };
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments(filter);

    res.json({
      questions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate new question using AI
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { topic, difficulty = 'Medium' } = req.body;
    
    const generatedQuestion = await GeminiService.generateQuestion(topic, difficulty);
    
    const question = new Question({
      ...generatedQuestion,
      topic,
      difficulty,
    });
    
    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate question' });
  }
});

// Get AI hint
router.post('/:id/hint', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentCode } = req.body;
    
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const hint = await GeminiService.generateHint(question.description, currentCode || '');
    res.json({ hint });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate hint' });
  }
});

// Get AI solution
router.get('/:id/solution', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const solution = await GeminiService.generateSolution(question.description);
    res.json({ solution });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate solution' });
  }
});

export default router;