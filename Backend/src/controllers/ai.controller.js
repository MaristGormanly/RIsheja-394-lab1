const openai = require('../config/openai');
const TaskModel = require('../models/task.model');

class AIController {
  static async generateTasks(req, res) {
    try {
      const { projectDescription, userId } = req.body;

      const systemPrompt = `You are a project planning assistant. When given a project description, create a list of tasks in JSON format. Each task should have:
- title
- description
- priority (HIGH, MEDIUM, LOW)
- status (should always be TO_DO)
- estimated_time (in hours)

Respond ONLY with the JSON array of task objects, without any markdown formatting or additional text. Example:
{
  "tasks": [
    {
      "title": "Example Task",
      "description": "Description here",
      "priority": "HIGH",
      "status": "TO_DO",
      "estimated_time": 2
    }
  ]
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: projectDescription }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" } // Force JSON response
      });

      let tasksData;
      try {
        const content = completion.choices[0].message.content;
        tasksData = JSON.parse(content);
        
        if (!tasksData.tasks || !Array.isArray(tasksData.tasks)) {
          throw new Error('Invalid response format');
        }
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
        tasks: createdTasks
      });
    } catch (error) {
      console.error('Error in generateTasks:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = AIController; 