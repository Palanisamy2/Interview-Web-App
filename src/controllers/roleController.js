const { Role, Stack } = require('../models');

async function listRoles(req, res) {
  try {
    const roles = await Role.findAll({
      where: { isActive: true },
      include: [
        {
          model: Stack,
          as: 'stacks',
          where: { isActive: true },
          required: false
        }
      ]
    });
    return res.json(roles);
  } catch (error) {
    console.error('List roles error:', error);
    return res.status(500).json({ error: 'Failed to fetch roles' });
  }
}

async function listStacksForRole(req, res) {
  try {
    const { id } = req.params;
    const stacks = await Stack.findAll({
      where: { roleId: id, isActive: true }
    });
    return res.json(stacks);
  } catch (error) {
    console.error('List stacks error:', error);
    return res.status(500).json({ error: 'Failed to fetch stacks' });
  }
}

module.exports = {
  listRoles,
  listStacksForRole
};

