function validateChatRequest(req, res, next) {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Request body must include a non-empty messages array.',
    });
  }

  const invalidMessage = messages.find(
    (item) => !item.role || !item.content || typeof item.content !== 'string'
  );

  if (invalidMessage) {
    return res.status(400).json({
      error: 'Invalid message format',
      message: 'Each message must include a role and content string.',
    });
  }

  next();
}

module.exports = { validateChatRequest };
