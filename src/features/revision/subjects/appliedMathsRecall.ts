/**
 * Closed-book recall prompts for each Applied Mathematics topic. They are
 * written for this app (no exam wording) and ask for the ideas a learner must
 * be able to produce without notes. The learner checks answers against their
 * own notes and the Formulae and Tables booklet.
 */
export const appliedMathsRecall: Readonly<Record<string, readonly string[]>> = {
  'am-kinematics-1d': [
    'Write the four constant-acceleration equations and say which quantity each one leaves out.',
    'What do the gradient and the area under a velocity-time graph represent?',
    'Sketch displacement-time, velocity-time and acceleration-time graphs for a car that speeds up, cruises and brakes to rest.',
    'How do you set up a problem with two stages, such as a reaction time followed by braking?',
    'For a ball thrown straight up, what are its velocity at the top and its acceleration throughout? How do you choose the positive direction?',
  ],
  'am-calculus-for-motion': [
    'Write velocity and acceleration as derivatives of displacement. How do you go back with integration, and where do the initial conditions go?',
    'Use the chain rule to show that a = v dv/ds. When is this form the useful one?',
    'Differentiate and integrate powers of t, e^(kt), sin(kt) and cos(kt).',
    'What is the difference between displacement and distance travelled, and when does it matter?',
  ],
  'am-network-terms': [
    'Define node, edge, weight, path, cycle, connected graph and tree.',
    'What is the difference between a directed and an undirected network?',
    'How does a network differ from a road map? What does it keep and what does it leave out?',
    'How many edges does a tree with n nodes have, and why?',
  ],
  'am-adjacency-matrices': [
    'How do you write the adjacency matrix of a directed network? How is an undirected one different?',
    'Multiply two 3 by 3 matrices by hand without slips.',
    'What does an entry of M squared tell you? What about M cubed?',
    'How can you read the number of routes of a given length between two nodes from a power of the matrix?',
  ],
  'am-vectors-2d': [
    'Write position, velocity and acceleration as vectors in i and j, and say how they link through differentiation.',
    'How do you find the magnitude and direction of a vector, and a unit vector in a given direction?',
    'Give both forms of the dot product. What does a dot product of zero tell you?',
    'How do you find the component of one vector in the direction of another?',
  ],
  'am-projectiles': [
    'Write the horizontal and vertical components of the launch velocity and the equation of motion in each direction.',
    'How do you find the time of flight, the greatest height and the range?',
    'How do you find the speed and direction of travel at a given time?',
    'Why can a target be hit with two different launch angles, and how do you find both?',
    'What stays constant in the horizontal direction, and why?',
  ],
  'am-spanning-trees': [
    'List the steps of Kruskal\u2019s algorithm and of Prim\u2019s algorithm.',
    'How do you start Prim\u2019s algorithm from a distance table, and how do you spot an edge that would make a cycle?',
    'Why do both algorithms give the same total weight even when the trees differ?',
    'How should you set out the working so an examiner can follow the order of the edges?',
  ],
  'am-forces-newton': [
    'State Newton\u2019s three laws in your own words.',
    'Draw a free-body diagram for a block pulled along a surface. Name every force.',
    'What is the difference between mass and weight?',
    'Write the equation of motion for a person in a lift that accelerates up and one that accelerates down.',
    'What does it mean for a particle to be in equilibrium, and how do you use it?',
  ],
  'am-planes-friction': [
    'Draw the forces on a block on a rough inclined plane. Which way does friction act when it slides down? Up?',
    'How do you resolve forces parallel and perpendicular to the plane to find the normal reaction?',
    'State the friction law F = \u03bcR and say what limiting friction means.',
    'How do you find the acceleration of a block moving up or down a rough incline?',
    'How do you find the angle at which a block is just about to slide?',
  ],
  'am-connected-masses': [
    'Write the equation of motion for each of two masses joined over a smooth pulley. What do you assume about the tension?',
    'How do you solve the two equations to find the acceleration and the tension?',
    'How does the acceleration of a movable pulley relate to the accelerations of the masses?',
    'How do the equations change when one mass sits on a rough table?',
  ],
  'am-dynamic-programming': [
    'Define stage, state, decision and return in a dynamic programming problem.',
    'State Bellman\u2019s Principle of Optimality in your own words.',
    'Why do you work backwards from the final stage, and how do you lay out the table?',
    'What must your final answer contain: the strategy, the total cost, or both?',
  ],
  'am-dijkstra': [
    'List the steps of Dijkstra\u2019s algorithm. When does a label become permanent?',
    'How do you recover the shortest path, not just its length?',
    'How is Dijkstra\u2019s algorithm different from a minimum spanning tree algorithm?',
    'Why does the algorithm need non-negative weights?',
  ],
  'am-momentum-impulse': [
    'Define momentum and impulse. How are they linked?',
    'State the principle of conservation of momentum and when it applies.',
    'How do you handle a two-dimensional problem, for example an explosion or an oblique impact?',
    'How do you find the average force from an impulse and a contact time?',
  ],
  'am-collisions': [
    'State Newton\u2019s experimental law and what e = 0 and e = 1 mean.',
    'Which two equations do you write for a direct collision of two spheres?',
    'How do you handle a collision with a fixed wall, and what is the speed after it?',
    'How do you find the kinetic energy lost in a collision?',
    'For an oblique collision, which components change and which stay the same?',
  ],
  'am-project-scheduling': [
    'How do you build an activity network from a precedence table?',
    'Explain the forward pass and the backward pass. What do early and late times mean?',
    'What is a critical path and how do you find it?',
    'What is float and how do you calculate it for an activity?',
  ],
  'am-resistive-forces': [
    'Write Newton\u2019s second law for a particle moving against a resistance proportional to a power of the speed.',
    'Why do you choose a = dv/dt in some problems and a = v dv/ds in others?',
    'How do you find a terminal velocity from the equation of motion?',
    'Do an integration by parts and an integration by substitution without notes.',
  ],
  'am-work-energy': [
    'Write the work done by a constant force and by a varying force. How do you calculate it by integration?',
    'State kinetic and potential energy formulae, and when mechanical energy is conserved.',
    'State Hooke\u2019s law for an elastic string and the elastic potential energy stored.',
    'How do you use the work-energy principle when friction acts?',
    'Define power and link it to force and speed.',
  ],
  'am-circular-motion': [
    'Link speed, angular velocity and period. What is the acceleration towards the centre?',
    'Which forces provide the centripetal force for a conical pendulum? Write the two equations.',
    'For a particle on a string in a vertical circle, what are the tension and speed at the bottom and at the top?',
    'What condition on the speed lets the particle complete the circle?',
  ],
  'am-dimensional-analysis': [
    'Write the dimensions of speed, acceleration, force, work, power and pressure in M, L and T.',
    'How do you check that an equation is dimensionally consistent?',
    'How do you find the powers in a formula such as a period of a pendulum from its dimensions?',
    'What can dimensional analysis not tell you?',
  ],
  'am-greedy-vs-dp': [
    'Describe how a greedy algorithm makes its choices.',
    'Give an example where a greedy choice fails to give the best answer, and say how dynamic programming avoids that.',
    'Which algorithms from the course are greedy, and why can you trust them?',
    'How would you justify that an algorithm gives an optimal answer?',
  ],
  'am-recurrence': [
    'What do you need to start a sequence defined by a recurrence relation?',
    'Write the same relationship using differences and using a recurrence.',
    'What do first-order, second-order, linear and homogeneous mean?',
    'Generate the first terms of a sequence from its recurrence by hand.',
  ],
  'am-difference-modelling': [
    'How do you turn a description such as a yearly growth rate or a loan repayment into a difference equation? What do n and U(n) stand for?',
    'How do you write a model when the change in one period depends on the change in the previous period?',
    'How do you use the first terms given in a problem to set the starting conditions?',
    'What do supply and demand, loan and disease models look like as difference equations?',
  ],
  'am-difference-solving': [
    'How do you solve a first-order linear difference equation, homogeneous and inhomogeneous?',
    'How do you use the characteristic equation for a second-order equation, for each type of roots?',
    'What form of particular solution do you try for a constant, a linear or a quadratic right-hand side?',
    'How do you use the starting values to find the constants in the general solution?',
    'For a non-linear equation, how do you find the fixed points?',
  ],
  'am-differential-modelling': [
    'How do you turn \u201crate of change proportional to\u2026\u201d into a differential equation?',
    'How do you set up the initial condition and units?',
    'Write the equations for growth and decay, Newton\u2019s law of cooling and a model with a limiting value.',
    'How do you explain what a solution means in context?',
  ],
  'am-differential-solving': [
    'List the steps of separation of variables, including the constant of integration.',
    'How do you reduce a second-order equation of the form d2x/dt2 = f(v) or f(x) to first order?',
    'Describe a numerical method (such as Euler\u2019s method) and write one step by hand.',
    'How can a slope field or graph show the behaviour of a solution?',
  ],
}
