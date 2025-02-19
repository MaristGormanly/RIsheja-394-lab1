const openai = require('../config/openai');
const TaskModel = require('../models/task.model');

class AIController {
  static async generateTasks(req, res) {
    try {
      const { projectDescription, userId } = req.body;

      const systemPrompt = `You are a project planning assistant. When given a project description, create a list of specific, actionable tasks in JSON format. Each task must have these exact fields:
- title (string): A clear, concise task name
- description (string): Detailed explanation of what needs to be done
- priority (string): Must be exactly "HIGH", "MEDIUM", or "LOW"
- status (string): Must be exactly "TO_DO"
- estimated_time (number): Estimated hours to complete

Example response format:
{
  "tasks": [
    {
      "title": "Set up development environment",
      "description": "Install and configure all necessary development tools and dependencies",
      "priority": "HIGH",
      "status": "TO_DO",
      "estimated_time": 2
    }
  ]
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: projectDescription }
        ],
        temperature: 0.3,
        max_tokens: 800,
        top_p: 0.9,
        response_format: { type: "json_object" }
      });

      let tasksData;
      try {
        const content = completion.choices[0].message.content;
        tasksData = JSON.parse(content);
        
        if (!tasksData.tasks || !Array.isArray(tasksData.tasks)) {
          throw new Error('Invalid response format');
        }

        // Validate each task
        tasksData.tasks = tasksData.tasks.map(task => ({
          title: task.title,
          description: task.description,
          priority: task.priority.toUpperCase(),
          status: "TO_DO",
          estimated_time: Number(task.estimated_time)
        }));

      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error('Failed to parse AI response');
      }

      // Create tasks in database
      const createdTasks = await Promise.all(
        tasksData.tasks.map(task => 
          TaskModel.createTask({
            ...task,
            created_by: userId
          })
        )
      );

      res.json({
        message: 'Tasks generated successfully',
        tasks: tasksData.tasks
      });
    } catch (error) {
      console.error('Error in generateTasks:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = AIController; 