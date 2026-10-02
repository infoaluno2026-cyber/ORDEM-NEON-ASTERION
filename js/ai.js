window.ORDEM = window.ORDEM || {};

function updateAllyAI(ally, player, enemies, dt) {
  if (!ally || !ally.alive || ally.isPlayer) return;

  let nearest = null;
  let nearestDist = Infinity;

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    if (!enemy || enemy.dead) continue;
    const dx = enemy.x - ally.x;
    const dist = Math.abs(dx);
    if (dist < nearestDist) {
      nearest = enemy;
      nearestDist = dist;
    }
  }

  if (nearest && nearestDist < 180) {
    ally.facing = nearest.x >= ally.x ? 1 : -1;
    const targetX = nearest.x;
    const move = targetX > ally.x ? 1 : -1;
    if (Math.abs(nearest.x - ally.x) > 50) {
      ally.x += move * ally.speed * 30 * dt;
    }
    ally.attackCooldown = Math.max(0, ally.attackCooldown - dt);
    if (Math.abs(nearest.x - ally.x) < ally.attackRange + 20 && ally.attackCooldown <= 0) {
      ally.performAttack(enemies);
      ally.attackCooldown = ally.attackCooldownConfig;
    }
  } else {
    const followTarget = player.x + (ally.id === 'rio' ? -80 : 80);
    const move = followTarget > ally.x ? 1 : -1;
    if (Math.abs(followTarget - ally.x) > 30) {
      ally.x += move * ally.speed * 30 * dt;
    }
    ally.facing = player.x >= ally.x ? 1 : -1;
  }

  if (player.y < ally.y - 20 && ally.onGround) {
    ally.vy = -ally.jumpForce * 28;
    ally.onGround = false;
  }
}

window.ORDEM.updateAllyAI = updateAllyAI;
