/**
 * Closed-book recall prompts for each Physics topic. They follow the strands of
 * the new Leaving Certificate Physics specification (first examined in 2027)
 * and are written for this app. They include experiments and applications that
 * appear in the specification and sample papers, but they are not exam wording.
 */
export const physicsRecall: Readonly<Record<string, readonly string[]>> = {
  'ph-measurement': [
    'Explain how scientific ideas are modified over time, and why peer review, reproducibility, clear communication and agreed conventions matter in Physics.',
    'Distinguish between a question, a testable hypothesis and a prediction. What makes an investigation fair, safe and fit for purpose?',
    'Define random error, systematic error, accuracy, precision, repeatability and reproducibility, and explain how each affects confidence in results.',
    'Explain how to use SI units, prefixes, powers of ten, significant figures, dimensional or unit analysis and order-of-magnitude estimates to judge whether an answer is reasonable.',
    'Describe how to identify patterns, anomalous observations, slopes and intercepts in data, and how to communicate conclusions honestly to a stated audience.',
    'Give an example of a media-based scientific claim. How would you check it for evidence, relevance, bias and missing detail?',
  ],
  'ph-motion': [
    'Define displacement, velocity, acceleration and time, and write the relationships between them in words and symbols.',
    'Sketch and interpret displacement-time and velocity-time graphs, including what their slopes and areas represent.',
    'State the three kinematics equations for constant acceleration and describe when they can be used.',
    'Distinguish between scalar and vector quantities, and explain how to resolve a vector into perpendicular components.',
    'Describe how to verify the law of addition of vectors in one or two dimensions using primary or secondary data.',
  ],
  'ph-forces-momentum': [
    'State Newton’s three laws of motion and explain the ideas of mass, centre of mass and resultant force.',
    'Describe normal, frictional, resistant, tension, buoyancy and gravitational forces, and say when each is important in a model.',
    'Define pressure and density, and explain how to solve problems on solids resting on a surface and pressure in a fluid.',
    'Define momentum and explain how the principle of conservation of momentum is used for direct collisions in one and two dimensions.',
    'State Hooke’s law, describe how to verify it for an elastic object, and explain what the force-extension graph shows.',
  ],
  'ph-energy': [
    'Define work done by a constant force, power, kinetic energy, gravitational potential energy and elastic potential energy, and write the formula for each.',
    'Explain how the work-energy model can solve mechanical problems without resolving forces in detail.',
    'Describe how to link the area under a force-extension graph to the work done in stretching or compressing a material.',
    'State the principle of conservation of energy and use it to describe energy changes in falling bodies, springs and other everyday systems.',
    'Explain what is meant by efficiency and give one mechanical or electrical example where not all transferred energy is useful.',
  ],
  'ph-circular-gravity': [
    'Explain centripetal force and describe the motion of an object moving in a circle with constant angular velocity.',
    'Show how gravity can provide the centripetal force for planetary motion, and describe the evidence behind this model.',
    'Describe at least one primary-data method and several secondary-data methods for determining g, and compare their assumptions.',
    'Define gravitational field strength at a point, and explain how to calculate it at the surface of a planet and above the surface.',
    'Explain escape velocity, Kepler’s third law, and the difference between near-Earth and geostationary orbits, including a use of each.',
  ],
  'ph-heat': [
    'Define temperature and thermometric property, and compare the Kelvin and Celsius scales.',
    'Define heat capacity, specific heat capacity, latent heat and specific latent heat, and describe how to determine them from data.',
    'Explain, using the particle model, conduction, convection and changes of state.',
    'Explain what a heat pump does, and how U-value is used to describe heat transfer through a material.',
    'Describe how insulation can reduce energy use, improve efficiency and support sustainability in homes or buildings.',
  ],
  'ph-waves': [
    'Define rest position, displacement, crest, trough, amplitude, wavelength, frequency, time period and wave speed, and explain how amplitude is linked to energy carried by a wave.',
    'Compare mechanical and electromagnetic waves, and compare transverse and longitudinal waves.',
    'Explain resonance and give one real-life example in which the driving frequency matches the natural frequency.',
    'Explain why sound needs a medium, and relate pitch and loudness to the wave characteristics of sound.',
    'Describe standing waves on a stretched string using nodes, antinodes, harmonics and the fundamental, and explain how length, tension and mass per unit length affect frequency.',
    'Explain the Doppler effect for sound, including one application such as ultrasound measurement of blood flow.',
  ],
  'ph-light': [
    'State the laws of reflection and refraction, define refractive index and critical angle, and explain total internal reflection.',
    'Describe how converging and diverging lenses form images, and use the lens formula and ray diagrams correctly.',
    'Explain diffraction, interference, coherence, polarisation, Young’s slits and the use of a diffraction grating.',
    'Classify the regions of the electromagnetic spectrum by wavelength, frequency, ionising ability and everyday use.',
    'Explain dispersion and describe why different colours refract by different amounts in a prism.',
    'Define solar irradiance and explain why it matters for life on Earth and for energy technologies.',
  ],
  'ph-electric-fields': [
    'Explain how neutral objects become charged, including charging by friction and by induction, and the role of grounding.',
    'Describe the behaviour of conductors and insulators in electrostatic situations, including the distribution of charge on each.',
    'State Coulomb’s law and explain why it is an inverse-square law.',
    'Define electric potential as work done per unit charge and electric field strength at a point, and relate field strength to force on a charge.',
    'Describe how field lines represent the direction and relative strength of electric fields around charged objects and between oppositely charged objects.',
  ],
  'ph-circuits': [
    'Define current, charge, potential difference, emf, resistance and power, and write the relationships between them.',
    'Explain how electrical energy is converted in circuit components, and derive or use the equivalent resistance formulae for series and parallel circuits.',
    'State Ohm’s law, compare ohmic and non-ohmic conductors, and describe how to verify the I-V relationship for an ohmic conductor.',
    'Define resistivity and describe how to determine it from measurements of a wire.',
    'Explain the safety features of mains electricity, including earthing, fuses, MCBs and RCDs.',
    'Compare direct current and alternating current, and define rms voltage and rms current.',
  ],
  'ph-magnetism': [
    'Describe magnetic fields around a permanent magnet, a current-carrying wire and a solenoid, and explain how a ferrous core changes the solenoid field.',
    'Explain the force on a moving charge and on a current-carrying conductor in a magnetic field, including the use of Fleming’s hand rules.',
    'Explain the motor effect and describe the operation of a simple DC motor, including the role of the split-ring commutator.',
    'State Faraday’s law and Lenz’s law, and explain the generator effect for AC and DC generators.',
    'Explain mutual inductance in a transformer, calculate transformer efficiency, and explain why high transmission voltage reduces National Grid losses.',
  ],
  'ph-electronics': [
    'Explain the difference between a conductor, an insulator and a semiconductor.',
    'Describe n-type and p-type doping, the p-n junction, and the depletion layer.',
    'Explain forward and reverse bias, and describe the I-V behaviour of a diode.',
    'Explain how an LED, an LDR and a thermistor behave in circuits, and what each is used for.',
    'Describe how a transistor acts as a switch in a sensor circuit.',
  ],
  'ph-quantum': [
    'Describe the evidence for the electron, including thermionic emission, cathode rays and the deflection of electron beams in electric and magnetic fields.',
    'Explain the photoelectric effect and why the wave model of light cannot account for the observed dependence on frequency.',
    'Define threshold frequency and work function, and write Einstein’s photoelectric equation.',
    'Describe a photocell and give practical applications of the photoelectric effect in sensor technology.',
    'Compare photoelectric emission with X-ray production in an X-ray tube.',
    'Compare the Thomson, Rutherford and Bohr models of the atom, and explain how energy levels lead to emission spectra.',
  ],
  'ph-nuclear': [
    'Describe natural background radiation and explain how ionising radiation can be detected.',
    'Compare alpha, beta and gamma radiation in terms of ionising effect, penetrating power, charge, mass and deflection in electric or magnetic fields.',
    'Explain spontaneous radioactive decay, define half-life and activity, and solve decay problems from data or graphs.',
    'Define isotope, nuclear stability, mass defect and binding energy, and explain how these ideas are connected.',
    'Compare nuclear fission and fusion, including controlled and uncontrolled chain reactions and issues in electrical generation.',
  ],
  'ph-particles': [
    'Explain the significance of Cockcroft and Walton’s work, and state the meaning of mass-energy equivalence.',
    'Describe matter in terms of fermions and bosons, and name the quarks and leptons in the Standard Model.',
    'Give the quark content and charge of the proton and the neutron, and explain how the quark model predicts those charges.',
    'Explain how the strong and weak nuclear forces act, and describe beta decay in terms of particles and interactions.',
    'Explain matter and anti-matter, and describe positron-electron annihilation.',
  ],
  'ph-astronomy': [
    'Explain how emission line spectra are produced and how they can be used to identify elements in stars or gas clouds.',
    'Relate each emission line to an electron transition between energy levels and the release of a photon.',
    'Explain the Doppler effect for light and how a shift in spectral lines shows motion towards or away from the observer.',
    'Describe how the analysis of spectra has contributed to our understanding of the universe.',
  ],
}
