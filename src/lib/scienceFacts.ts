import type { MorningEntryDraft } from '../types'

export type EpistemicStatus = 'fact' | 'inference' | 'speculation'

export interface Insight {
  headline: string
  text: string
  citation: string
  tag: string                     // short label shown in UI
  confidence?: number             // 0.0–1.0, how strongly research supports this
  epistemic?: EpistemicStatus     // fact=replicated data | inference=framework-based | speculation=theoretical
  reasoning?: string              // Research Mode: 1–2 sentence chain explaining why this rule fired
  biasWarning?: string            // Research Mode: projection / interpretation risks
}

// ── Content detectors ─────────────────────────────────────────────────────────

function matchesPeople(people: string[], keywords: string[]): boolean {
  const all = people.map(p => p.toLowerCase())
  return keywords.some(k => all.some(p => p.includes(k)))
}

function matchesText(rawText: string, keywords: string[]): boolean {
  const t = rawText.toLowerCase()
  return keywords.some(k => t.includes(k))
}

function matchesObjects(objects: string[], keywords: string[]): boolean {
  const all = objects.map(o => o.toLowerCase())
  return keywords.some(k => all.some(o => o.includes(k)))
}

// ── Insight library ───────────────────────────────────────────────────────────
// Each entry has: detection logic + research-backed insight
// Priority order matters; first match wins

interface InsightRule {
  detect: (d: MorningEntryDraft) => boolean
  insight: Insight
}

const RULES: InsightRule[] = [

  // ── Ex-partner ──────────────────────────────────────────────────────────────
  {
    detect: d =>
      matchesPeople(d.people, ['ex', 'ex-', 'former', 'ex-boyfriend', 'ex-girlfriend', 'ex-husband', 'ex-wife']) ||
      matchesText(d.rawText, ['my ex', 'ex ', 'ex-', 'former partner', 'former boyfriend', 'former girlfriend', 'old partner', 'used to date', 'we used to be together', 'we broke up years']),
    insight: {
      tag: 'Relationship schema',
      headline: 'Your brain is replaying a relationship schema, not the person',
      text: 'Dreaming about an ex-partner is among the most common dream themes reported across cultures. Research shows these dreams rarely signal unresolved romantic feelings. Instead, your brain uses emotionally significant people from your past as stand-ins for relationship patterns: attachment styles, emotional roles, or unresolved dynamics that are currently active in your waking life. The person represents a template, not a wish.',
      citation: 'Domhoff (2022), Neurocognitive Model; Schredl & Reinhard (2008), Journal of Psychology',
      confidence: 0.68,
      epistemic: 'inference',
      reasoning: 'Ex-partner or relationship keywords detected in people/text fields. The schema-activation model is neurocognitive consensus (Domhoff 2022). The specific pattern represented requires waking-life context to determine.',
      biasWarning: 'High projection risk: the person may represent a current relational dynamic, not unresolved feelings for them specifically.',
    },
  },

  // ── Relationship conflict / breakup — BEFORE Chase (fight with partner != generic attack) ──
  {
    detect: d =>
      matchesText(d.rawText, [
        'broke up with my', 'broke up with him', 'broke up with her', 'we broke up', 'he broke up with me', 'she broke up with me',
        'breaking up with my', 'breaking up with him', 'breaking up with her', 'break up with my',
        'ended the relationship', 'end the relationship', 'relationship ended', 'relationship is over',
        'split up with', 'we split up', 'left me', 'he left me', 'she left me', 'leaving me',
        'divorce', 'divorced', 'getting divorced', 'filing for divorce', 'we divorced',
        'fight with my boyfriend', 'fight with my girlfriend', 'fight with my husband', 'fight with my wife', 'fight with my partner',
        'fighting with my boyfriend', 'fighting with my girlfriend', 'fighting with my husband', 'fighting with my wife', 'fighting with my partner',
        'argument with my boyfriend', 'argument with my girlfriend', 'argument with my husband', 'argument with my wife', 'argument with my partner',
        'arguing with my boyfriend', 'arguing with my girlfriend', 'arguing with my husband', 'arguing with my wife', 'arguing with my partner',
        'yelling at my boyfriend', 'yelling at my girlfriend', 'screaming at my partner',
      ]) ||
      (
        matchesText(d.rawText, ['boyfriend', 'girlfriend', 'husband', 'wife', 'my partner', 'my fiance']) &&
        matchesText(d.rawText, ['fight', 'fighting', 'fought', 'argue', 'argued', 'arguing', 'argument', 'yelling', 'screaming', 'broke up', 'breaking up', 'split', 'leaving', 'left me', 'conflict'])
      ),
    insight: {
      tag: 'Relationship conflict processing',
      headline: 'Your brain is rehearsing the relationship, not predicting its end',
      text: 'Relationship conflict and breakup dreams are among the most emotionally intense and common dream categories. They are strongly continuity-based: your brain processes felt insecurity, unresolved tension, or attachment anxiety during REM, not a premonition of what will happen.\n\nWhat the conflict content signals:\n\n· You broke up in the dream: the brain is stress-testing the feared scenario, not predicting it. People with anxious attachment have more breakup dreams regardless of relationship health. The dream encodes the fear of loss, not its likelihood.\n· The fight is about something mundane or irrational: the subject is almost always displaced. A dream fight about dishes or a small decision carries real emotional weight that has not yet found its waking articulation. The emotion is the signal; the subject is the brain finding a container for it.\n· The fight is about something real in the relationship: high-continuity processing. The brain is working through an unresolved tension without the social cost of having the actual conversation.\n· You felt devastated by the breakup: strong attachment. The intensity of distress is proportional to how much the relationship matters to you.\n· You felt relief during or after the breakup: the brain may be surfacing ambivalence that has not been consciously acknowledged.\n· Your partner was unrecognizable or behaved completely out of character: the dream is not about them as they are. It is about a relational role or pattern they represent.\n\nAttachment theory (Bowlby, 1969) predicts that anxious attachment reliably generates more conflict and abandonment dream content across relationships. These dreams are one of the most consistent continuity signals in the research literature.',
      citation: 'Schredl (2003, 2024), Dreaming, APA; Bowlby (1969), Attachment and Loss; Mikulincer & Shaver (2007), Attachment in Adulthood',
      confidence: 0.80,
      epistemic: 'inference',
      reasoning: 'Relationship conflict and breakup keywords detected in conjunction with partner-role terms. Continuity correlation is empirically well-supported. Attachment-anxiety link is clinically replicated.',
      biasWarning: 'If there is active real-world relationship distress, the continuity frame is primary and the dream may be processing that directly rather than encoding symbolic content.',
    },
  },

  // ── Chase / pursuit / being followed ────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, [
        'chasing', 'chased', 'running from', 'following me', 'being followed', 'pursued',
        'running away', 'escape', 'escaping', 'caught', 'hunting me', 'after me',
        'couldn\'t run', 'legs wouldn\'t move', 'someone was chasing', 'something was chasing',
        'ran away', 'ran from', 'tried to escape', 'trying to escape', 'was following me',
        'something following', 'someone following', 'being hunted', 'felt followed',
      ]),
    insight: {
      tag: 'Shadow pursuit: threat simulation',
      headline: '81.5% of people have had a chase dream, and who is chasing tells you exactly what you\'re avoiding',
      text: 'Chase dreams are the single most universally reported recurrent dream, with 81.5% lifetime prevalence (Nielsen et al., 2003, Dreaming). The Jungian insight that changes how you read them: you are not running from an external threat. You are running from a part of yourself. The identity of the pursuer is the signal.\n\n· Faceless / shadowy unknown figure: aspects of yourself never yet made conscious; existential anxiety with no identifiable cause\n· Known person (friend, partner, colleague): a quality you\'ve projected onto them that you haven\'t owned in yourself; or unresolved relational tension you\'re actively avoiding\n· Authority figure (boss, parent, police): the internalized critical voice; you\'re failing to meet a standard and the standard is chasing you\n· Monster or creature: shadow material that has grown large through prolonged avoidance; Jungian analysts note that when dreamers turn and face the monster, it almost always shrinks\n· Animal (wolf, bear, bull): suppressed instinctual drives, bodily, sexual, or aggressive energy the dreamer has labeled unacceptable\n· Being caught or paralyzed: paradoxically often the most productive outcome; forced contact with what you\'ve been fleeing is the precondition for integration\n\nRevonsuo\'s Threat Simulation Theory provides the evolutionary substrate: chase scenarios represent the prototypical ancestral threat. But the pursuer\'s identity is always personal.',
      citation: 'Nielsen et al. (2003), Dreaming; Revonsuo (2000), Behavioral and Brain Sciences; Jung, Collected Works Vol. 9i; Zadra, Desjardins & Marcotte (2006), Consciousness and Cognition',
      confidence: 0.72,
      epistemic: 'inference',
      reasoning: 'Chase/pursuit keywords detected. Prevalence datum (81.5%) is empirical FACT. Pursuer-identity breakdown applies Jungian shadow framework, well-integrated across clinical practice but not directly RCT-tested.',
      biasWarning: 'Projection risk: the pursuer identity interpretation assumes Jungian archetypal mapping. A known person may represent themselves; check for direct waking-life conflict first.',
    },
  },

  // ── Falling ─────────────────────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['falling', 'fell down', 'dropped', 'plummeting', 'falling off', 'falling from', 'fell off', 'off a cliff', 'off a building', 'into a void', 'falling through', 'slipping off', 'losing my footing', 'ground gave way', 'floor gave out', 'tumbling']),
    insight: {
      tag: 'Hypnic collapse: instability signal',
      headline: 'Falling has two distinct causes, one neurological, one psychological, and the experience tells you which',
      text: 'Falling is among the most universally reported dream experiences, with high physiological grounding. But the type of falling matters: there are two distinct mechanisms producing very different experiences.\n\nPhysiological falling (hypnic jerk variant): occurs at sleep onset, not during deep REM. The brain generates a sudden sensation of falling, triggering a muscle contraction that wakes you with a jolt. This is the hypnic myoclonia mechanism: during sleep onset, motor activity briefly disinhibits and the brain interprets this as a loss of footing. It correlates with fatigue, caffeine, stress, and irregular sleep. If you experienced a sudden jolt fall and woke immediately, this is primarily neurological, not symbolic.\n\nDream-narrative falling (anxiety variant): a prolonged fall in the context of a dream narrative, from a building, cliff, into a void. This is the psychologically meaningful form. The specific context carries the message:\n\n· Falling off a structure you were standing on (building, cliff, bridge): sudden loss of a position, status, or foundation you believed was solid. Something you were standing on has given way. The height you were at before falling encodes how much is at stake.\n· Falling into a void or endless darkness: the most existentially weighted variant. No ground in sight means no resolution visible. This encodes profound uncertainty, the absence of any stable reference point in a domain that matters.\n· The ground rushing up: catastrophic thinking in progress. Your brain is simulating a feared outcome at high speed. The question is what the impact represents.\n· Falling but never landing: one of the most common and least discussed variants. Suspension without resolution. Processing that has not concluded. A situation in waking life where the outcome has not yet landed.\n· Slipping from something you were holding: a grip has failed. Something you were managing or maintaining has become unsustainable. What were you holding before you fell?\n· Falling alongside someone: the other person\'s identity is informative. A shared fall encodes a shared risk or a relationship that is going through disruption together.\n\nFalling frequency increases measurably during periods of perceived instability: new roles, relationship endings, health uncertainty.',
      citation: 'Hobson (2009), Nature Reviews Neuroscience; Revonsuo (2000), Behavioral and Brain Sciences; Nielsen et al. (2003), Dreaming; Hartmann (1995), The Nature and Functions of Dreaming',
      confidence: 0.77,
      epistemic: 'inference',
      reasoning: 'Falling keywords detected. Hypnic jerk neurophysiology is empirical FACT. Anxiety elevation correlation is replicated. Sub-type breakdowns (void = existential uncertainty, never landing = unresolved processing) are framework-based inference.',
      biasWarning: 'Sudden-jolt waking falls are primarily physiological and should not be over-interpreted symbolically. Extended narrative falls during dream sequences are the meaningful form.',
    },
  },

  // ── Self-death (ego death) ───────────────────────────────────────────────────
  // Must come BEFORE the general death rule — fires when the dreamer themselves dies
  {
    detect: d =>
      matchesText(d.rawText, [
        'i died', 'i was dead', 'i was dying', 'i die', 'i got killed', 'i was killed',
        'my own death', 'my death', 'died in my dream', 'died in the dream',
        'i died in', 'i was murdered', 'i was shot', 'i drowned', 'i fell and died',
        'i was executed', 'killing me', 'killed me', 'i stopped breathing',
        'watched myself die', 'saw myself dead', 'i died and',
      ]) &&
      !matchesText(d.rawText, ['undead', 'zombie']),
    insight: {
      tag: 'Ego death: identity transformation',
      headline: 'Dying in your own dream is the most significant transformation signal in all of dream research',
      text: 'Your own death in a dream is not a nightmare — it is the brain\'s most direct encoding of ego death: the shedding of a self that is no longer viable. Across every framework that studies this (Jungian, clinical, cognitive), the consensus is identical: self-death in dreams correlates with major identity transformation, not mortality anxiety.\n\nThis is one of the oldest and most cross-culturally consistent dream symbols. In Jungian terms, the dreaming ego must die for a new configuration of self to emerge. The death is not the end — it is the threshold.\n\nThe manner of death is the specific message:\n\n· Peaceful death, dying in sleep: the transformation is accepted. Something in you is ready to let go. You are not resisting what needs to end.\n· Violent or sudden death: the transformation is being forced rather than chosen. Something in your life is ending abruptly, and the psyche is processing the shock of that rupture rather than a gradual release.\n· Murdered by someone specific: pay attention to who killed you. That person — or more precisely, the quality they represent — is the agent of your transformation. What role or force do they embody in your life?\n· Dying slowly or from illness: a prolonged ending. Something has been dying for a long time and the dream is acknowledging what waking awareness has been deferring.\n· Dying and then continuing to exist as a ghost or spirit: the most common variant after self-death. The old identity has ended but the consciousness persists. You are between versions of yourself.\n· Watching yourself die from outside: dissociative processing of the transformation. You are already partly outside the old self, observing its ending from a position of mild detachment.\n\nSelf-death dreams appear most strongly at the major thresholds: the end of a significant relationship, leaving a career or identity you have held for years, recovery from addiction, becoming a parent, entering or exiting a decade, any moment where who you have been must be released for who you are becoming.',
      citation: 'Jung, Collected Works Vol. 9i (ego death); Hartmann (1995, 2010), The Nature and Functions of Dreaming; Loewenberg, Dream On It; Domhoff (2003), The Scientific Study of Dreams; van der Kolk (2014), The Body Keeps the Score',
      confidence: 0.73,
      epistemic: 'inference',
      reasoning: 'First-person death keywords detected ("I died", "I was killed" etc.). Ego death interpretation is cross-framework consensus (Jungian, clinical, cognitive). Manner-of-death breakdown is inference-level, analytically consistent across multiple traditions.',
      biasWarning: 'Low mortality-prediction risk: the consensus is strong that self-death does not predict or encode fear of literal death, except in people with active health crises or suicidal ideation — in those contexts, clinical support takes priority over symbolic interpretation.',
    },
  },

  // ── Deceased person (continuing bonds) — MUST come before Death of others ────
  {
    detect: d =>
      matchesText(d.rawText, ['my late', 'who passed away', 'who has passed', 'who died', 'who passed', 'already passed', 'been gone', 'passed some time', 'died years ago', 'died a few years', 'died long ago', 'deceased', 'no longer alive', 'dead relative', 'dead friend', 'dead family', 'visited me in', 'came to me in', 'appeared to me in', 'came back to me']) &&
      !matchesText(d.rawText, ['i died', 'i was dead', 'i was dying', 'i got killed']),
    insight: {
      tag: 'Continuing bonds',
      headline: 'Dreaming of the deceased is normal, common, and usually therapeutic',
      text: 'Dreaming of the deceased is far more common than most people admit: 53% of U.S. adults report having been visited by a deceased family member in a dream, and 86% of people who lose a spouse will dream about them in the following year. Research shows 92% of these spouse-loss dreams are predominantly positive; the person appears healthy, free of illness, or communicating comfort. The continuing bonds model, now the clinical consensus, confirms that maintaining an inner relationship with the deceased is not pathological; it is a healthy grief mechanism. The clinical signal is actually the opposite: absence of these dreams correlates with higher prolonged grief disorder risk at 12 months.',
      citation: 'Rees (1971), BMJ; Penberthy et al. (2023), UVA Division of Perceptual Studies; Holloway & Bennett (2014), Omega: Journal of Death and Dying; Deckers et al. (2021), Psychological Medicine',
    },
  },

  // ── Death (of others) ───────────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['died', 'death', 'dead', 'dying', 'killed', 'funeral', 'grave', 'coffin', 'passing away', 'passed away', 'murder', 'murdered']) &&
      !matchesText(d.rawText, ['undead', 'zombie']),
    insight: {
      tag: 'Transformation: ego death',
      headline: 'Death in dreams is one of the most misread symbols; it almost never concerns mortality',
      text: 'The consensus across clinical dream research is direct: death in dreams encodes ending, transformation, and the shedding of a former identity, not literal loss or prediction. Who dies in the dream determines what is being transformed.\n\n· Your own death: the most important type. Across frameworks (Jungian, Freudian, clinical), self-death signals ego death, the end of a way of being that is no longer viable. It appears most strongly during major transitions: becoming a parent, leaving a career, recovering from addiction, midlife shifts. The manner matters: decapitation = breaking free from over-intellectualizing; drowning = being overwhelmed by transformation; dying peacefully = acceptance of necessary change.\n· A parent dying: usually encodes symbolic independence, not a death wish. Most common during developmental milestones where you are moving beyond parental identity. Mother dying = transformation of emotional dependency or nurturing patterns; father dying = transformation of your relationship to authority, judgment, or internalized standards.\n· A child dying: almost always processes intense parental anxiety or responsibility fear, not prediction. Also common as metaphor for mourning a previous stage of a child\'s life (they\'ve grown past something). If you have no children, the child likely represents your own inner vulnerability or innocence.\n· A sibling or friend dying: they represent a quality you associate with that person. What characteristic defines them in your mind? That quality, not the person, is what is transforming.',
      citation: 'Loewenberg, Dream On It; Wallace, The Complete A to Z Dictionary of Dreams; Domhoff (2003), The Scientific Study of Dreams; Hartmann (1995), Dreaming; Moore, Guy Counseling',
      confidence: 0.67,
      epistemic: 'inference',
      reasoning: 'Death/dying keywords detected. Transformation-not-mortality consensus is cross-framework (Jungian, clinical, cognitive). Who-died breakdown is framework-based INFERENCE, not directly tested in controlled trials.',
      biasWarning: 'If dreamer has recently experienced bereavement, literal grief processing is equally probable. Rule confidence drops to ~0.45 in active grief context.',
    },
  },

  // ── Flying ──────────────────────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['flying', 'flew', 'floating', 'soaring', 'hovering', 'levitating', 'gliding', 'airborne', 'weightless', 'could fly']),
    insight: {
      tag: 'Agency simulation: quality is the signal',
      headline: 'Flying is the most positively reported dream, but the quality of flight is the entire message',
      text: 'Flying dreams are reported by ~70% of adults across cultures (Nielsen et al., 2003) and are the most frequently desired experience in lucid dreaming. Adler\'s framework is the most useful here: flying represents the will to power, the drive for self-expression and mastery. The quality of flight tells you where you currently stand with that drive.\n\n· Effortless, joyful flight: genuine confidence, freedom from a previous constraint, creative or professional flow. The most positively valenced dream experience. Often coincides with the onset of lucid dreaming.\n· Struggling to stay airborne / heavy, labored flight: the aspiration is present but something, exhaustion, self-doubt, external pressure, impostor syndrome, is preventing its realization. The gap between wanting to soar and inability to sustain altitude is the message.\n· Low altitude (barely above the ground): restricted ambition, excessive caution, or testing new capacities while staying close to the familiar. Not willing to become fully visible yet.\n· Very high altitude, comfortable: broad perspective, genuine detachment from ordinary pressures, hard-won capacity to see the larger picture.\n· Turbulent / rapid / uncontrolled: overreach, momentum outrunning groundedness. Ambition exceeding capacity to sustain it.\n· Crashing from flight: distinct from falling. Encodes the failure of an intentional direction, a plan, project, or relationship trajectory the dreamer has invested in. The manner of crash matters: mechanical failure = external forces; pilot error = self-assigned responsibility.',
      citation: 'Nielsen et al. (2003), Dreaming; Adler, Will to Power Framework; LaBerge (Stanford), Lucid Dreaming Research; Revonsuo (2000), Behavioral and Brain Sciences',
      confidence: 0.74,
      epistemic: 'inference',
      reasoning: 'Flying keywords detected. Prevalence data (~70%) is empirical FACT. Flight-quality-as-agency framework is Adlerian INFERENCE, analytically consistent but not directly RCT-tested.',
    },
  },

  // ── Missing important event / can't get there ────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['missed the flight', 'missed my flight', 'missed the train', 'couldn\'t find the venue', 'couldn\'t get there', 'missed the event', 'flight was leaving', 'couldn\'t make it', 'missed the bus', 'missed the appointment', 'too late for the', 'arrived too late']) &&
      !matchesText(d.rawText, ['wedding', 'married', 'bride', 'groom', 'marriage']),
    insight: {
      tag: 'Anticipatory simulation: functional anxiety',
      headline: 'Dreaming of missing something important actually predicts better real-world outcomes',
      text: 'Missing-event dreams (flights, weddings, interviews) rank 5th in lifetime prevalence at ~59% of people (Nielsen & Zadra TDQ studies). A striking finding from Arnulf et al. (2014, Consciousness and Cognition): students who dreamed of failing or missing their exam the night before scored significantly higher on the actual exam (p=.01) than those who did not. The brain uses the missed-event dream as an anticipatory simulation, rehearsing the emotional stakes of failure, which activates preparatory behavior and executive focus. The anxiety in the dream is not pathological: it is functional. These dreams also persist for years after the original event has passed, suggesting the motif becomes a generic urgency template.',
      citation: 'Nielsen & Zadra, TDQ Studies, Dreaming (APA); Arnulf et al. (2014), Consciousness and Cognition; Pesant & Zadra (2006), Journal of Clinical Psychology',
      confidence: 0.83,
      epistemic: 'fact',
      reasoning: 'Missing-event keywords detected. Arnulf (2014) exam performance finding has direct statistical support (p=.01). Anticipatory simulation model is replicated across multiple event types.',
    },
  },

  // ── Being late / exam / performance ─────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['exam', 'test', 'unprepared', 'not ready for', 'school', 'class', 'presentation', 'interview', 'performance anxiety', 'failed the', 'failing the', 'couldn\'t answer', 'blank paper', 'blank mind', 'forgot to study', 'didn\'t study', 'late for the exam', 'late for the test', 'late for my exam', 'late for class', 'missed the exam', 'missed the test', 'wrong classroom', 'wrong class', 'wrong subject', 'pen wouldn\'t write', 'computer froze', 'equipment failed']),
    insight: {
      tag: 'Evaluation simulation: impostor signal',
      headline: 'You are being evaluated in your waking life, and your brain is rehearsing the emotional stakes',
      text: 'Exam and performance dreams are among the five most universally reported dream scenarios across all cultures and age groups. The most important research finding: they are not nostalgic. An adult dreaming of a high school exam is almost never processing a past experience. The dreaming brain borrows the evaluative emotional context from adolescence because it is structurally identical to what the person is facing now. The school is borrowed scenery; the anxiety is current.\n\nThe specific scenario is the signal:\n\n· Unprepared for an exam you knew was coming: the classic impostor syndrome marker. You are facing a situation in waking life where you fear your competence will be exposed as insufficient. The evaluator in the dream, teacher, examiner, audience, encodes the actual person or system whose judgment feels dangerous.\n· Arriving late or missing the exam entirely: a variant that encodes not just fear of failure but fear of losing the opportunity itself. The missed-event and performance-anxiety patterns compound here.\n· Blank paper, blank mind: the specific dream image of inability to recall anything despite preparation encodes intellectual self-doubt, not actual incompetence. It appears disproportionately in high-performers and perfectionists.\n· Wrong classroom, wrong subject, wrong building: identity mismatch more than performance anxiety. Something in your current role or path does not feel like yours. You are in the right institution but the wrong room.\n· Equipment failure (pen won\'t write, computer freezes): feeling ill-equipped for a situation you are otherwise ready for. External tooling anxiety, not competence anxiety.\n· Examined by a specific person: that person, or what they represent to you (judgment, authority, criticism), is active in your current concerns. The teacher is rarely just a teacher.\n\nA striking empirical finding from Arnulf et al. (2014, Consciousness and Cognition): students who dreamed of failing or missing their exam the night before scored significantly higher on the actual exam than those who did not (p=.01). The anxiety is functional preparation, not pathological fear.',
      citation: 'Arnulf et al. (2014), Consciousness and Cognition; Schredl & Reinhard (2011), Dreaming; Nielsen et al. (2003), Dreaming; Domhoff (2003), UCSC DreamBank; Schacter & Addis (2007), Nature Reviews Neuroscience',
      confidence: 0.78,
      epistemic: 'inference',
      reasoning: 'Exam/performance keywords detected. Arnulf (2014) performance correlation is empirical FACT (p=.01). Sub-type breakdowns apply cognitive dream theory and Jungian framework; impostor-syndrome mapping is inference, not directly RCT-tested.',
      biasWarning: 'Moderate projection risk: the specific evaluator in the dream is the most informative element. Who is judging you is more diagnostic than what you are being tested on.',
    },
  },

  // ── House / rooms / buildings ────────────────────────────────────────────────
  {
    detect: d =>
      matchesObjects(d.objects, ['house', 'room', 'building', 'home', 'apartment', 'basement', 'cellar', 'attic', 'corridor', 'hallway', 'mansion', 'castle', 'flat', 'villa', 'cabin']) ||
      matchesText(d.rawText, [
        'house', 'room', 'home', 'apartment', 'basement', 'attic', 'cellar', 'hallway', 'corridor',
        'mansion', 'castle', 'cabin', 'flat', 'villa', 'building', 'floor', 'staircase',
        'my house', 'old house', 'a house', 'the house', 'in a house', 'childhood home',
        'unknown building', 'strange room', 'unfamiliar room', 'new room', 'hidden room',
        'secret room', 'discovered a room', 'the basement', 'the attic', 'the cellar',
        'downstairs', 'upstairs', 'another floor', 'extra room', 'rooms i didn\'t know',
        'a room', 'the room', 'empty room', 'dark room', 'locked room', 'in a building',
      ]),
    insight: {
      tag: 'House = psyche',
      headline: 'The house in your dream is the most direct map of your personality available to you',
      text: 'Architectural settings appear in 42–47% of all dream reports, more than any other setting category (Domhoff, Sleep and Dream Database). Across both Jungian and cognitive research frameworks, the house is the most consistent self-representational symbol in dreaming. Jung identified this in his 1909 house dream; Roesler\'s 2020 empirical Structural Dream Analysis (Journal of Analytical Psychology) confirmed that dream structure directly correlates with the dreamer\'s psychological structure and changes measurably with therapeutic progress.\n\nThe specific part of the house is the signal:\n· Basement / cellar: material you avoid, repressed content, instinctual drives; things below the threshold of conscious attention\n· Attic: stored memories, the past, ancestral or family patterns you carry\n· Hidden or new room discovered: an emerging aspect of self, undiscovered capacity, or something you\'ve been ready to acknowledge but haven\'t yet\n· Condition of the house: the most reliable indicator. A crumbling house tracks felt psychological instability; an expanding or well-maintained house tracks felt integrity and growth\n· Unfamiliar house: aspects of yourself not yet integrated or currently developing\n· Childhood home: early identity patterns being re-activated by a current situation\n\nImportant caveat: these meanings are not fixed universal keys. Roesler\'s same study found that symbols require individual contextual interpretation. A basement means something different to someone who grew up fearing their basement than to someone who used it as a creative space. The emotional tone you felt in that space is more diagnostic than its architectural label.',
      citation: 'Roesler (2020, 2025), Journal of Analytical Psychology; Domhoff (2003, 2022), UCSC Sleep and Dream Database; Hall (1953), Journal of General Psychology; Hartmann (2010), The Nature and Functions of Dreaming',
    },
  },

  // ── Being naked / exposed ────────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['naked', 'undressed', 'no clothes', 'exposed', 'embarrassed', 'shame', 'nothing on', 'barely dressed', 'forgot to get dressed', 'realized i had no clothes', 'in my underwear', 'topless']),
    insight: {
      tag: 'Visibility threshold: transparency signal',
      headline: 'Nakedness in dreams is about being seen: the critical question is how people respond',
      text: 'Being naked in public ranks consistently in the top five most universally reported dream themes across cultures. Freud originally framed it as wish-fulfillment; contemporary research is more precise. The emotional tone and the crowd response are the entire diagnostic signal.\n\nThe scenario that matters most is not whether you are naked, but what happens when people see you:\n\n· Nobody notices: the most clinically significant variant. You are experiencing anxiety about transparency, visibility, or exposure that is almost certainly disproportionate to how others actually perceive you. You feel far more exposed than you appear. This is the classic impostor syndrome variant: the fear of being seen through is greater than the reality of how you are being seen.\n· People see you and are shocked or judging: your felt vulnerability matches a genuine evaluative situation. You are currently in a context where being scrutinized feels threatening: putting creative work out, a new role, a public transition, a relationship where you\'ve been unusually honest.\n· People see you and don\'t care: processing the aftermath of vulnerability. You exposed something and the feared judgment did not materialize, but you haven\'t fully integrated that safety yet.\n· You feel liberated or comfortable naked: one of the rarer variants but highly meaningful. Shedding of social performance, of masks and roles. Often accompanies a genuine breakthrough in authenticity or a relationship where pretense has been dropped.\n· Partial undress (underwear, one item missing): partial exposure, partial readiness to be seen. Not yet fully committed to visibility in a domain that matters.\n· Professional or formal setting: the evaluative and the vulnerable are colliding. Something private is at risk of becoming public in your work or public identity.\n\nThe timing is informative: nakedness dreams spike around launches, publications, relationship milestones, new social environments, and any situation where a private self is becoming public.',
      citation: 'Nielsen et al. (2003), Dreaming; Schredl (2010), Dreaming; Zadra & Donderi (2000), Journal of Sleep Research; Freud, Interpretation of Dreams (1900)',
      confidence: 0.70,
      epistemic: 'inference',
      reasoning: 'Nakedness/exposure keywords detected. Universal prevalence (top 5) is empirical FACT. Nobody-notices sub-type as impostor variant is framework-based inference, clinically consistent but not directly RCT-tested.',
      biasWarning: 'Moderate projection risk: the crowd response in the dream is more diagnostic than the nudity itself. A nakedness dream in isolation without context of current transparency concerns warrants caution before applying symbolic frame.',
    },
  },

  // ── Drowning / underwater / submerged ────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['drowning', 'underwater', 'submerged', 'can\'t breathe', 'couldn\'t breathe underwater', 'sinking', 'under the water', 'pulled under', 'dragged under', 'deep sea', 'ocean floor', 'couldn\'t surface', 'held underwater']),
    insight: {
      tag: 'Emotional flooding: overnight therapy',
      headline: 'Drowning dreams are your brain doing its most intensive emotional work',
      text: 'Being submerged or unable to breathe underwater is one of the most emotionally intense dream experiences, and research now explains why it is adaptive rather than just distressing. Matthew Walker\'s "overnight therapy" model, confirmed by a 2024 Nature Scientific Reports study, shows that emotional charge is stripped from difficult memories specifically during REM sleep, but only in people who recall dreaming. The brain processes overwhelming emotional content by constructing vivid aquatic metaphors: the submersion is the emotional "flooding" being worked through. Domhoff\'s cross-cultural content analysis confirms that drowning imagery correlates with waking feelings of being overwhelmed; the quality of the water (dark, deep, turbulent) tracks the perceived emotional load.',
      citation: 'Walker, Why We Sleep (2017); Nature Scientific Reports (2024), "Evidence of an active role of dreaming in emotional memory processing"; Domhoff (2003), UCSC DreamBank',
    },
  },

  // ── Water ───────────────────────────────────────────────────────────────────
  {
    detect: d =>
      matchesObjects(d.objects, ['water', 'ocean', 'sea', 'river', 'lake', 'flood', 'swimming', 'wave', 'pool', 'rain', 'stream', 'waterfall', 'pond']) ||
      matchesText(d.rawText, [
        'water', 'ocean', 'sea', 'river', 'lake', 'flood', 'rain', 'pool', 'pond', 'stream',
        'waterfall', 'wave', 'waves', 'swimming', 'swam', 'swim', 'deep water', 'the ocean',
        'the sea', 'the river', 'the lake', 'wading', 'current', 'tidal wave', 'rainstorm',
        'the water', 'in the water', 'into the water', 'across the water', 'fell in the water',
        'body of water', 'calm water', 'dark water', 'murky water', 'rushing water',
      ]),
    insight: {
      tag: 'Emotional landscape: state is the signal',
      headline: 'Water is the most direct map of your emotional life; its condition is the message',
      text: 'Jung called water "the commonest symbol for the unconscious." Hartmann (Tufts) provided the empirical grounding: people who have recently experienced emotional overwhelm consistently produce Central Images of flooding, tidal waves, and being swept away. The water encodes the emotional impact, not the event itself. The state and quality of the water is everything.\n\n· Calm, clear water: emotional stability and clarity. You have resolved or are integrating something. Transparency in the water mirrors transparency in self-understanding.\n· Murky or dark water: emotional confusion, things not yet visible to yourself, or actively suppressed content. The cloudiness maps to how clouded your current understanding of a situation is.\n· Turbulent water (rapids, storm, choppy sea): active emotional conflict, inner turmoil, or being buffeted by chaotic circumstances. You are in the middle of difficulty.\n· Flooding / rising water: the hallmark of overwhelm. Obligations, grief, or pressure building. The rising quality signals escalation, not resolution.\n· Swimming competently: navigating emotional life successfully. Ease of swimming = felt competence in managing what you\'re in.\n· Ocean: in Jungian terms, the vast collective unconscious, something larger than personal history. Ocean dreams often accompany existential questioning, major life transitions, or a felt sense of being part of something beyond ordinary concerns.\n· River: the dimension of time and life\'s forward movement. Flowing smoothly = acceptance; struggling against current = resistance to inevitable change.\n· Lake or pond: contained, static emotion, a mood or condition that is not yet moving.',
      citation: 'Jung, Collected Works; Hartmann (Tufts), Central Image Theory (2010); Bulkeley, An Introduction to the Psychology of Dreaming (2017); Schredl (2024), Continuity Hypothesis',
    },
  },

  // ── Work / colleagues ───────────────────────────────────────────────────────
  {
    detect: d =>
      matchesPeople(d.people, ['boss', 'colleague', 'coworker', 'manager', 'team', 'client', 'employee', 'supervisor', 'director', 'ceo']) ||
      matchesObjects(d.objects, ['office', 'work', 'meeting', 'desk', 'laptop', 'computer', 'conference', 'boardroom', 'cubicle']) ||
      matchesText(d.rawText, ['at work', 'the office', 'my boss', 'my colleague', 'work meeting', 'job', 'workplace', 'my job', 'the project', 'deadline', 'fired', 'quit', 'promotion', 'colleague', 'coworker', 'client', 'presentation', 'performance review']),
    insight: {
      tag: 'Occupational continuity: unfinished processing',
      headline: 'Your brain did not finish processing today\'s work before sleep: this is the brain\'s overtime',
      text: 'The continuity hypothesis is nowhere more precise than in work dreams. Schredl\'s longitudinal research on professionals found that work dream frequency is one of the most accurate objective measures of occupational cognitive load: more reliable, in some studies, than self-reported stress. If work is in your dreams, work is in your head at a level that outlasts your working hours.\n\nBut the specific content is the real signal. The dreaming brain does not randomly replay the workday. It selects the emotionally unresolved elements:\n\n· Your boss appears: the internalized authority is active. In Jungian terms, the boss figure encodes whatever you have projected onto them: judgment, standards, approval, the capacity to define your worth. The boss\'s behavior in the dream (supportive, critical, absent, hostile) reflects your current relationship with that internalized standard, not necessarily their actual behavior.\n· A specific colleague appears: unresolved relational tension, comparison anxiety, or a quality in that person you have not acknowledged in yourself. What is their defining characteristic? That quality is what is active.\n· Being fired or demoted: rarely about literal job security (though it can be, in genuinely threatened roles). More commonly encodes a fear of being seen as inadequate and removed from a situation you care about. The fear is about belonging and worth, not the paycheck.\n· Being promoted or recognized: can be positive continuity (you feel this is coming and your brain is simulating it) or compensatory processing (you want recognition you are not receiving).\n· A presentation going wrong: performance anxiety specific to a delivery situation. Who is the audience, and what do they represent as evaluators?\n· Can\'t find the office, wrong floor, wrong meeting: identity disorientation. You are not at home in your current role or you are navigating a professional transition without a clear map.\n· Doing work that is not your actual job: your brain may be processing a mismatch between what you do and what you feel you should be doing.',
      citation: 'Schredl (2003, 2024), Continuity Hypothesis; Pesant & Bhatt (2004), Clinical Psychology Review; Domhoff (2022), Neurocognitive Model; Jung, Collected Works',
      confidence: 0.76,
      epistemic: 'inference',
      reasoning: 'Work/colleague keywords detected in people, objects, or text. Frequency-as-cognitive-load is empirically supported by Schredl longitudinal data. Specific figure interpretations (boss = internalized authority) are Jungian inference, clinically consistent but not directly tested.',
    },
  },

  // ── Family ──────────────────────────────────────────────────────────────────
  {
    detect: d =>
      matchesPeople(d.people, ['mother', 'father', 'mom', 'dad', 'sister', 'brother', 'parent', 'grandma', 'grandpa', 'grandmother', 'grandfather', 'sibling', 'family', 'son', 'daughter', 'child', 'aunt', 'uncle', 'cousin']) ||
      matchesText(d.rawText, [
        'my mother', 'my father', 'my mom', 'my dad', 'my sister', 'my brother',
        'my parents', 'my family', 'my grandmother', 'my grandfather', 'my grandma', 'my grandpa',
        'my son', 'my daughter', 'my child', 'my aunt', 'my uncle', 'my cousin',
        'my sibling', 'my kids', 'my children', 'my baby', 'my parent',
        'mother', 'father', 'sister', 'brother', 'grandmother', 'grandfather',
      ]),
    insight: {
      tag: 'Family archetype: role, not person',
      headline: 'Each family member who appears in a dream carries a specific psychological role, not just a face',
      text: 'Family members are among the most frequent dream characters across all age groups (Hall & Van de Castle, 1966). The Jungian insight that makes this useful: the dreamed family member carries their emotional and relational *role*, not their current reality. They are archetypes as much as people.\n\n· Mother: emotional sustenance, nurturing, belonging, dependency, and in negative form the internalized critic that questions your worthiness. A cold or absent mother figure often reflects current self-doubt or emotional hunger, not your actual relationship with your mother. Also: the Great Mother archetype, the generative and creative principle.\n· Father: authority, structure, performance standards, and judgment. Dreams of the father are disproportionately connected to achievement situations, when you are being evaluated, launching something, or defying expectations. A demanding father figure usually encodes your own internalized standard, not your father\'s opinion. Also: the question "Am I capable / acceptable?"\n· Key difference: the mother domain centers on "Am I loved and safe?"; the father domain centers on "Am I capable and meeting the standard?"\n· Sibling (same sex): near-mirror of the self. Qualities similar to yours being either celebrated or projected away. Often processes rivalry, identity comparison, and competing drives within yourself.\n· Sibling (opposite sex): in Jungian terms, may represent the Anima (for men) or Animus (for women), the contrasexual aspects of the self being activated. An opposite-sex sibling can encode: emotional depth you\'re not accessing (Anima); decisive energy you need (Animus).\n· Grandparents: ancestral patterns, mortality, accumulated wisdom, or the family inheritance you carry without having chosen it.',
      citation: 'Hall & Van de Castle, The Content Analysis of Dreams (1966); Jung, Collected Works; Bulkeley, Dream Studies Archive; Domhoff (2003), The Scientific Study of Dreams',
    },
  },

  // ── War / combat / battle ─────────────────────────────────────────────────────
  {
    detect: d =>
      matchesObjects(d.objects, ['war', 'gun', 'weapon', 'bomb', 'soldier', 'army', 'military', 'battle', 'troops', 'battlefield', 'tank', 'missile', 'nuclear']) ||
      matchesText(d.rawText, ['war', 'combat', 'battle', 'soldier', 'army', 'military', 'shooting', 'bombs', 'explosions', 'war zone', 'under attack', 'bunker', 'troops', 'front line', 'enemy', 'invasion', 'conflict']) &&
      !matchesText(d.rawText, ['water gun', 'toy gun', 'video game']),
    insight: {
      tag: 'Combat continuity: never a replay',
      headline: 'War dreams follow the continuity hypothesis, but are never literal replays',
      text: 'Combat dream content tracks waking-life threat exposure directly; people with military experience dream about war significantly more than civilians (continuity hypothesis). But Ernest Hartmann (Tufts) demonstrated a crucial finding: even in PTSD nightmares, "the dream always makes new connections; it is a creation, not a replay." In Vietnam veterans with PTSD, ~79% of war nightmares contained distorted elements, only 53% were set in the present, and few were strict replications of actual events. For civilians, war imagery appears as a metaphorical construct for waking-life conflict, threat, or feeling under siege, not a reflection of news consumption. PTSD-related war nightmares specifically involve disrupted REM emotional processing and are among the most treatable conditions via image rehearsal therapy.',
      citation: 'Hartmann (Tufts), "Dreaming Always Makes New Connections"; International Journal of Dream Research, Combat Dream Series; VA PTSD National Center',
    },
  },

  // ── Recurring elements flag ──────────────────────────────────────────────────
  // This rule is a fallback with a useful general frame

  // ── Teeth falling out ────────────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['teeth', 'tooth', 'teeth fell', 'teeth falling', 'lost my teeth', 'teeth broke', 'crumbling teeth', 'teeth crumbling', 'teeth rotting']),
    insight: {
      tag: 'Physical incorporation: bruxism',
      headline: 'Teeth dreams are more likely physical than psychological',
      text: 'Counter to popular belief, research finds teeth dreams are not primarily linked to anxiety or distress. The strongest empirical predictor is dental irritation during sleep, specifically jaw tension and bruxism (teeth clenching/grinding). Your brain incorporates physical sensations into dream content. If you wake with jaw tension or headaches, that is more diagnostic than any psychological reading. Teeth dreams affect 39% of people, with 16% experiencing them recurrently.',
      citation: 'Rozen & Soffer-Dudek, Frontiers in Psychology (2018); PMC6168631',
      confidence: 0.84,
      epistemic: 'fact',
      reasoning: 'Teeth keywords detected. Bruxism/dental irritation correlation has direct laboratory evidence. Physical incorporation of jaw sensation is established in sleep neuroscience.',
      biasWarning: 'Low bias risk; one of the most physiologically grounded dream types. Psychological anxiety interpretation (Freudian) is not supported by controlled studies.',
    },
  },

  // ── Being lost / unfamiliar place ────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['lost', 'getting lost', 'i was lost', 'couldn\'t find', 'didn\'t know where', 'unfamiliar place', 'strange place', 'wrong direction', 'maze', 'couldn\'t find the way', 'no idea where', 'wrong street', 'wrong city', 'couldn\'t navigate', 'map was wrong', 'wrong turn', 'disoriented', 'didn\'t recognize']),
    insight: {
      tag: 'Navigational anxiety: no map for current terrain',
      headline: 'Being lost in a dream is a spatial metaphor for a waking situation with no clear path',
      text: 'Dreams of being lost are the brain\'s most literal spatial encoding of existential disorientation. The continuity hypothesis is direct: lost dreams spike reliably during major transitions, identity uncertainty, relocation, career pivots, relationship endings, and any situation where the person\'s internal map no longer matches their terrain. The environment in which you are lost carries specific meaning.\n\nThe setting is diagnostic:\n\n· Lost in a city or urban environment: social and navigational overwhelm. The city is other people, systems, and structures you cannot orient within. Often accompanies new social environments, cultural displacement, or feeling lost within an institution.\n· Lost in a building, office, or indoor maze: internal complexity. You are navigating a specific system (organization, relationship, belief structure) that has become labyrinthine. You cannot find the exit from something structural.\n· Lost in nature or a forest: in Jungian terms, entering the forest is entering the unconscious. This is a more primal disorientation, less about social navigation and more about encountering something you have not mapped within yourself. Nature dreams of being lost often accompany genuinely exploratory transitions rather than crisis-driven ones.\n· Familiar place that does not look right: a more disturbing variant. The place should be known but is not. This encodes cognitive dissonance, a situation that should be comprehensible but has become strange. Also associated with gaslighting anxiety and environments where trust has eroded.\n· Lost and panicked: the urgency suggests the transition feels threatening rather than exploratory. There is a destination you feel you must reach and cannot.\n· Lost but curious: an underreported variant. Being lost without distress encodes exploration, a willingness to be in the unknown. Often appears at the beginning of genuinely chosen transitions rather than forced ones.\n\nThe emotional quality of the dream is almost more informative than the setting: the same map-free environment can encode either crisis or adventure depending on the felt tone.',
      citation: 'Domhoff (2003), The Scientific Study of Dreams; Nielsen & Levin (2007); Jung, Collected Works (forest symbolism); Hartmann (2010), The Nature and Functions of Dreaming',
      confidence: 0.73,
      epistemic: 'inference',
      reasoning: 'Lost/disoriented keywords detected. Transition-anxiety correlation is replicated across multiple continuity studies. Setting-specific breakdown (city vs. forest vs. building) applies Jungian spatial symbolism framework, inference-level evidence.',
    },
  },

  // ── Animals: snakes / spiders ───────────────────────────────────────────────
  {
    detect: d =>
      matchesObjects(d.objects, ['snake', 'spider', 'snakes', 'spiders', 'serpent', 'cobra', 'tarantula', 'python', 'viper', 'rattlesnake', 'scorpion', 'wasp', 'hornet', 'centipede']) ||
      matchesText(d.rawText, ['snake', 'spider', 'serpent', 'cobra', 'venom', 'bitten by', 'web', 'fangs', 'hissing', 'coiled', 'slithering', 'spider web', 'caught in a web', 'wrapped around', 'swarm', 'scorpion', 'wasp']),
    insight: {
      tag: 'Reptile and arachnid: hidden threat or hidden power',
      headline: 'Snakes and spiders do not track literal contact: they are the most cross-culturally stable threat symbols in dreaming, and the two species mean very different things',
      text: 'Unlike dogs and cats, which follow the continuity hypothesis (you dream about them proportionally to waking contact), snake and spider dreams have no correlation with real-world contact. They operate at a different level: they are phylogenetically old threat symbols, activating the same subcortical fear circuits that predate the cortex. But the two species carry distinct symbolic registers.\n\nSnakes:\n\n· The snake is the most cross-culturally consistent symbol in all of human mythology, appearing in nearly every religious, therapeutic, and symbolic tradition. In dreams, behavior matters most:\n· A snake that threatens or pursues: something in your environment carries hidden danger, possibly a person or situation that presents one face but conceals something threatening. The Jungian frame: what are you afraid is deceptive or has a hidden agenda?\n· A snake that bites: the feared thing has now made contact. The threat you were managing at a distance has gotten through. Where on your body were you bitten? That location is a metaphor.\n· A snake you observe but are not threatened by: latent power or energy that has not yet been directed. Jung identified the snake as a symbol of the life force itself (Kundalini parallel), healing and destruction in the same form. A non-threatening snake may encode powerful energy available but not yet claimed.\n· Multiple snakes: overwhelm from multiple simultaneous threats or sources of the same kind of anxiety.\n· Snake that speaks or is wise: the unconscious communicating directly in mythological register. Rare and significant.\n\nSpiders:\n\n· The spider is the primary dream symbol of entanglement, manipulation, and the complex web of dependencies:\n· Being caught in a web: feeling trapped by someone else\'s design, manipulative dynamics, or the accumulated weight of your own commitments and obligations. The web builder is usually someone in your life.\n· A spider descending toward you: something you have been avoiding is now approaching. The avoidance strategy is failing.\n· A large spider: an overwhelming version of whatever the spider represents to you. If you fear spiders consciously, the size tracks how large the feared thing has become.\n· A spider you observe without threat: creative construction, patience, the capacity to build something complex from nothing. The positive spider is the architect, not the predator.\n\nSchredl (2023) confirmed that both species appear during periods of diffuse emotional threat regardless of whether the dreamer has ever seen the animal in waking life.',
      citation: 'Schredl, International Journal of Dream Research (2023); Revonsuo (2000), Behavioral and Brain Sciences; Jung, Man and His Symbols (1964); Campbell, The Hero With a Thousand Faces; Hartmann (1995), The Central Image',
      confidence: 0.68,
      epistemic: 'inference',
      reasoning: 'Snake/spider/arachnid keywords detected. Absence of waking-contact correlation is empirical FACT (Schredl 2023). Species-specific symbolic breakdown applies Jungian and cross-cultural mythological frameworks: inference, not RCT-tested.',
      biasWarning: 'High cultural variability: snake symbolism varies significantly between cultures. The threat frame is most reliable; transformation/healing frame requires cultural context.',
    },
  },

  // ── Animals: wild / predatory ───────────────────────────────────────────────
  {
    detect: d =>
      matchesObjects(d.objects, ['bear', 'wolf', 'tiger', 'lion', 'shark', 'crocodile', 'alligator', 'panther', 'leopard', 'cheetah', 'jaguar', 'gorilla', 'bull', 'boar', 'fox', 'coyote', 'hawk', 'eagle', 'raven', 'crow', 'whale', 'dolphin']) ||
      matchesText(d.rawText, [
        'bear', 'wolf', 'tiger', 'lion', 'shark', 'crocodile', 'alligator', 'panther',
        'leopard', 'cheetah', 'jaguar', 'gorilla', 'bull', 'boar', 'fox', 'coyote',
        'hawk', 'eagle', 'raven', 'crow', 'whale', 'dolphin',
        'a bear', 'the bear', 'a wolf', 'the wolf', 'a tiger', 'the tiger',
        'a lion', 'the lion', 'a shark', 'the shark', 'a crocodile',
        'wild animal', 'predator', 'beast', 'wolves', 'bears', 'tigers', 'lions',
      ]),
    insight: {
      tag: 'Shadow: instinctual force',
      headline: 'Wild animals in dreams are not threats; they are suppressed power looking for a channel',
      text: 'In Jungian framework, wild animals consistently represent instinctual energy that has not been integrated, the dreamer\'s own drives, aggression, sexuality, or ambition that the ego has not yet claimed. The animal\'s behaviour is more diagnostic than its species:\n\n· Pursuing / threatening you: an instinctual force you\'re fleeing rather than owning\n· Wounded or caged: suppressed vitality; energy available but cut off from expression\n· Tamed or befriended: successful integration of that drive\n· Being mauled or attacked: the force has grown large from being ignored\n\nSpecific species carry consistent associations:\n· Bear: boundaries, protectiveness, retreat, the capacity to be fierce\n· Wolf: social instinct, hunger, loyalty vs. predatory drive\n· Tiger / lion: power, pride, raw authority; often surfaces when these are denied in waking life\n· Shark: unconscious threat, something moving beneath the surface that you haven\'t named\n· Eagle / hawk: ambition, clarity, a perspective not yet claimed\n\nResearch shows animal dreams increase in frequency during periods of stress, personal transition, and when a person is avoiding a significant confrontation or change.',
      citation: 'Jung, Man and His Symbols (1964); Hartmann, The Central Image (1995); Domhoff, Dream Content (2003)',
    },
  },

  // ── Animals: pets / dogs / cats ─────────────────────────────────────────────
  {
    detect: d =>
      matchesObjects(d.objects, ['dog', 'cat', 'pet', 'puppy', 'kitten', 'horse', 'bird', 'rabbit', 'hamster', 'fish', 'parrot', 'budgie']) ||
      matchesPeople(d.people, ['dog', 'cat', 'pet', 'my dog', 'my cat']) ||
      matchesText(d.rawText, [
        'dog', 'cat', 'puppy', 'kitten', 'horse', 'rabbit', 'hamster', 'parrot', 'bird',
        'my dog', 'my cat', 'my pet', 'the dog', 'the cat', 'a dog', 'a cat',
        'my horse', 'a horse', 'the horse', 'childhood pet', 'old pet',
        'lost pet', 'sick pet', 'pet died', 'stray dog', 'stray cat',
      ]),
    insight: {
      tag: 'Companion bond: direct continuity',
      headline: 'Familiar animals are the clearest continuity signal in all of dream research: their condition in the dream is what matters',
      text: 'Pet dreams are one of the strongest validations of the continuity hypothesis. Schredl\'s 2020 survey found that dog owners dream about dogs significantly more than non-owners, and the frequency directly tracks waking-life interaction time. Animals appear in approximately 7% of adult dreams (rising to 50% in children, for whom animals represent a broader world of agency and power not yet understood). The same animal carries different meaning depending on its condition in the dream.\n\nThe emotional role the animal plays is the signal, not the species:\n\n· Your own pet appears healthy and present: direct positive continuity. The bond is emotionally alive. Often appears during periods of transition as an anchor to what is stable and unconditionally reliable.\n· Your pet is sick, injured, or in danger: heightened responsibility anxiety. Something you care for feels at risk. If your actual pet is healthy, the dream is likely processing anxiety about something else that feels fragile and in your care.\n· A pet that has died appears: one of the most emotionally significant dream variants. The deceased pet dream follows the same "continuing bonds" model as deceased human dreams. 86% of bereaved pet owners report dreaming about their pets in the first year. The dream is grief processing, not prediction. If the pet appears healthy and happy, research shows this is the most common form and is associated with positive mourning integration.\n· A lost pet you cannot find: the continuity of loss anxiety. Either literal unresolved grief about a pet, or a metaphor for something you have lost access to that once provided unconditional comfort and safety.\n· A stray or unfamiliar animal that needs help: often encodes caretaking anxiety, an impulse toward responsibility for something that is not yet yours. Can also represent an abandoned aspect of self seeking reintegration.\n· A horse: in its own category. Horses in dreams consistently encode energy, drive, and the management of powerful natural force. A horse you can ride represents directed ambition; an uncontrollable horse represents drive exceeding your current management capacity.',
      citation: 'Schredl (2020), Dreaming About Dogs, International Journal of Dream Research; Domhoff (2003), UCSC DreamBank; Bowlby, Attachment Theory; Penberthy et al. (2023), Continuing Bonds Research',
      confidence: 0.74,
      epistemic: 'inference',
      reasoning: 'Pet/domestic animal keywords detected. Continuity correlation for pet owners is empirical FACT (Schredl 2020). Condition-based breakdown (sick pet = caretaking anxiety) applies continuity inference framework. Horse symbolism is Jungian inference.',
    },
  },

  // ── Recurring dream flag ──────────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['again', 'same dream', 'recurring', 'recurrent', 'had this dream before', 'this dream again', 'familiar dream', 'i\'ve had this']),
    insight: {
      tag: 'Recurring dream: unresolved concern',
      headline: 'Recurring dreams are your brain\'s persistence signal',
      text: 'Recurring dreams are one of the most replicated findings in dream research: they reliably signal an unresolved waking concern. About 65% of adults report at least one recurring dream, and the most common themes are failure/helplessness and being chased. Critically, research shows recurring dreams tend to cease when the underlying issue is resolved; their stopping is as informative as their presence. They are negatively-toned in 75% of cases. Logging this pattern is the first step to identifying the waking source.',
      citation: 'Schredl et al. (2022); Pesant & Bhatt, Clinical Psychology Review (2004)',
      confidence: 0.87,
      epistemic: 'fact',
      reasoning: 'Recurrence keywords detected. 65% lifetime prevalence and cessation-on-resolution finding are among the most replicated observations in clinical dream research.',
    },
  },

  // ── Nightmares ────────────────────────────────────────────────────────────────
  {
    detect: d =>
      d.emotions.includes('fearful') && (d.vividness >= 4 || matchesText(d.rawText, ['nightmare', 'horrifying', 'terrifying', 'woke up', 'woke me up', 'screaming', 'couldn\'t breathe', 'paralyzed', 'sleep paralysis'])),
    insight: {
      tag: 'Nightmare: REM emotion dysregulation',
      headline: 'Nightmares are a signal of disrupted emotional processing, not random',
      text: 'Nightmares are not simply bad dreams; they represent a failure of the normal REM process that strips emotional charge from memories. During healthy REM, norepinephrine is suppressed, allowing emotional memory re-processing without re-triggering stress. In nightmares, this suppression is incomplete. Frequency above 1–2 per week is clinically significant and treatable (CBT-I and image rehearsal therapy have strong evidence). If you are logging frequent nightmares, that pattern itself is the data worth tracking.',
      citation: 'ScienceDirect (2024), Systematic Review REM & Nightmares; Nielsen & Levin (2007)',
    },
  },

  // ── Car / driving / crash ────────────────────────────────────────────────────
  {
    detect: d =>
      matchesObjects(d.objects, ['car', 'vehicle', 'truck', 'bus', 'motorcycle', 'bike', 'van']) ||
      matchesText(d.rawText, [
        'car', 'driving', 'crashed', 'car crash', 'accident', 'lost control',
        'brakes failed', 'brakes didn\'t work', 'couldn\'t brake', 'swerving',
        'road', 'traffic', 'highway', 'steering', 'speeding', 'in a car',
        'was driving', 'drove', 'the car', 'my car', 'a car', 'truck', 'bus',
        'motorcycle', 'vehicle', 'ran off the road', 'went off the road',
      ]),
    insight: {
      tag: 'Loss of control: continuity',
      headline: 'Driving dreams map directly to perceived control in waking life',
      text: 'Driving dreams, especially crashes, brake failures, and loss of steering, are among the most consistent metaphors in dream research. They correlate strongly with perceived loss of control: feeling unable to slow down, change direction, or stop something in waking life. Research on professional drivers confirms the continuity effect (they dream about driving proportionally more), but for most people the car represents agency itself. Brake failure in particular tracks situations where you feel overcommitted and unable to decelerate.',
      citation: 'Domhoff (2003), Continuity Hypothesis; Psychology Today Dream Research (2024)',
    },
  },

  // ── Creativity / problem-solving ─────────────────────────────────────────────
  {
    detect: d =>
      (d.lucidity >= 2) ||
      matchesText(d.rawText, ['solved', 'figured out', 'idea', 'breakthrough', 'answer', 'invention', 'creative', 'puzzle', 'solution', 'suddenly knew', 'realized', 'understood']),
    insight: {
      tag: 'REM creative synthesis',
      headline: 'Your brain may have been actively solving problems during this dream',
      text: 'A 2024 Northwestern University study found that 75% of participants who had unsolved problems cued before sleep dreamed about them, and those who did solved 42% vs 17% for those who didn\'t. REM sleep enables the brain to form connections between weakly associated memories, a process unavailable during waking cognition. Sleep onset (Stage N1) has been shown to triple creative insight rates (Scientific Reports 2023). If you woke with an idea or a different perspective on something unresolved, that is the mechanism.',
      citation: 'Northwestern University (2024); Scientific Reports (2023), Sleep and Creative Insight; Cai et al., PNAS (2009)',
    },
  },

  // ── Pregnancy / birth / baby ──────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['pregnant', 'pregnancy', 'birth', 'baby', 'newborn', 'giving birth', 'infant', 'expecting', 'labour', 'labor', 'miscarriage', 'ultrasound', 'belly', 'bump', 'conceived', 'fetus', 'foetus', 'womb', 'contractions', 'delivery', 'cradle']) ||
      matchesObjects(d.objects, ['baby', 'infant', 'newborn', 'crib', 'pram', 'stroller', 'cradle']),
    insight: {
      tag: 'Gestation: something not yet born',
      headline: 'Pregnancy dreams are about what you are creating, not what you are predicting',
      text: 'Pregnancy and birth imagery is among the most symbolically loaded content in dream research. The first distinction that matters: are you actually pregnant or trying to conceive? If yes, the continuity hypothesis is dominant. Research shows pregnant women experience a 68% increase in dream frequency and vividness due to sleep architecture changes (REM disruption from waking), and content directly mirrors anxiety clusters: birth outcome fears, identity transition, partner anxiety, and readiness concerns. The emotional tone is the diagnostic signal, not the fact of pregnancy itself.\n\nFor non-pregnant dreamers, the research consensus across Jungian, cognitive, and clinical frameworks is that pregnancy encodes something in gestation: a project, identity, creative work, or potential that has been conceived but not yet made real. The specific scenario is everything:\n\n· You are pregnant (and not pregnant in waking life): something significant is developing inside you that the outside world cannot yet see. This is a project, an idea, a version of yourself, or a relationship that is real and growing but not yet externalized. The size of the belly tracks how developed it feels. The question the dream poses: are you ready for it to become visible?\n· The pregnancy is unexpected or unplanned: an opportunity or responsibility arrived that you did not consciously initiate. Not necessarily negative; unexpected pregnancies in dreams can encode genuine creative surprise. The emotional response in the dream, horror vs. wonder vs. numbness, is diagnostic.\n· Giving birth: the transition moment. The shift from internal to external, from private to public. This dream appears most strongly at the threshold of launches, releases, and moments of becoming visible. Difficult or painful birth encodes the cost of that emergence. An easy birth encodes readiness.\n· Miscarriage or pregnancy loss: one of the most emotionally weighted dream scenarios. When literal loss is not present in waking life, it almost universally processes intense anxiety about something at risk: a project you fear losing, a potential you feel slipping, a part of yourself that may not survive a current transition. If you have experienced real pregnancy loss, the dream may also be grief processing via the overnight therapy mechanism (REM emotional integration).\n· The baby after birth: what quality would you ascribe to this child in the dream? The baby IS that quality, externalized. A healthy, radiant baby: something well-created, ready to be in the world. A sick or endangered baby: profound nurturing anxiety, something fragile you are responsible for that feels at risk. A baby you do not want: a responsibility you feel burdened by, something others expect you to sustain that drains you. A baby left unattended: something important being neglected.\n· Someone else pregnant: a quality you have projected onto that person is developing. Or you are witnessing a creative/life process in someone close to you that is activating your own unresolved generativity: the question of what you yourself are creating, or should be.\n\nThe IPA frame that cuts through: what is the "baby" in your waking life right now? What are you nurturing that has not yet been seen by others? What are you afraid to lose before it is born?',
      citation: 'Valli et al. (2006), Neuroscience and Biobehavioral Reviews; PMC12075439 (2025), Pregnancy Dream Content; Domhoff (2003), UCSC Sleep and Dream Database; Hartmann (1995), The Central Image; Jung, Collected Works Vol. 9i; Walker (2017), Why We Sleep',
      confidence: 0.71,
      epistemic: 'inference',
      reasoning: 'Pregnancy/birth keywords detected in text or objects. Continuity finding for pregnant dreamers is empirical FACT. Sub-type breakdown (gestation = creative project, miscarriage = fear of loss) applies Jungian and clinical inference frameworks, consistent across multiple therapeutic traditions but not RCT-tested for each sub-type independently.',
      biasWarning: 'High context-sensitivity: if the dreamer is pregnant, recently miscarried, or actively trying to conceive, literal continuity processing is primary and the symbolic frame is secondary. Always check waking-life reproductive context before applying metaphorical interpretation.',
    },
  },

  // ── Cheating / infidelity ─────────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['cheating', 'cheated on', 'infidelity', 'unfaithful', 'betrayed', 'betrayal', 'affair', 'caught cheating', 'found out', 'cheating on me', 'being cheated', 'two-timing', 'was seeing someone', 'behind my back', 'with someone else', 'i cheated', 'i was unfaithful']),
    insight: {
      tag: 'Betrayal schema: attachment threat',
      headline: 'Cheating dreams almost never predict infidelity: they process emotional unmet needs and attachment fears',
      text: 'A 2023 Amerisleep survey of 2,000 people found 23% had dreamed about a partner cheating in the past year, one of the most common relationship dream scenarios across all attachment styles. The research consensus is consistent: these dreams are rarely surveillance of literal infidelity. They are the brain\'s processing of emotional gaps, relational insecurity, and attachment threat.\n\nWho is doing what in the dream is highly specific:\n\n· You discover your partner cheating: the dominant variant. Almost never about actual suspicion, unless there is genuine waking-life evidence. More commonly encodes one of three things: (1) you feel emotionally neglected or a lower priority than something else in your partner\'s life, whether that thing is work, friends, a hobby, or their own inner world; (2) a past betrayal, not necessarily romantic, has been activated by a current relational dynamic; (3) attachment anxiety is running at a high level for reasons that predate this relationship entirely.\n· Your partner is indifferent when caught: the most emotionally intense variant. Your fear is not of the betrayal itself but of being irrelevant to someone who matters. Abandonment schema at its core.\n· The person they cheat with is someone you know: jealousy and comparison anxiety are the active elements. What quality does that person represent that you feel you lack or that you feel your partner values over what you offer?\n· You are the one cheating: the most commonly misread variant. Rarely encodes a literal desire to be unfaithful. More often processes: a divided loyalty (you are giving energy to two competing priorities, roles, or identities), an acknowledged attraction you haven\'t confronted consciously, or a part of yourself that craves something your current life is not providing and you feel guilty about wanting.\n· You forgive them in the dream: active trust-repair processing. Your dreaming brain is working through the emotional residue of a real or feared trust rupture, not completing the resolution but rehearsing what it might feel like.\n\nAttachment style is the strongest predictor: people with anxious attachment dream of cheating 2-3x more frequently than securely attached people, regardless of relationship quality.',
      citation: 'Amerisleep Dream Survey (2023); Domhoff (2022), Relationship Schema Processing; Bowlby, Attachment Theory; Schredl et al. (2019), Psychology and Sexuality; Nielsen & Zadra, Typical Dream Themes Meta-analysis',
      confidence: 0.66,
      epistemic: 'inference',
      reasoning: 'Cheating/betrayal keywords detected. 23% prevalence is survey-based FACT. Attachment-anxiety link is clinically replicated. Specific sub-type interpretations (you cheating = divided loyalty) are framework-based inference, clinically consistent but not RCT-tested per sub-type.',
      biasWarning: 'Highest projection risk in the entire library: this rule must not be used to dismiss legitimate concerns about real-world infidelity. If the dreamer has concrete waking-life evidence of infidelity, the continuity explanation is primary. The symbolic frame applies only where no such evidence exists.',
    },
  },

  // ── Being attacked / violence ────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, [
        'attacked', 'attack', 'hit me', 'hitting me', 'fighting', 'fight', 'stabbed', 'shot',
        'shooting', 'someone came at me', 'threatened', 'violent', 'aggressor', 'assaulted',
        'assault', 'punching', 'punched', 'weapon', 'gun', 'knife', 'choked', 'strangled',
        'beaten', 'ambushed', 'mugged', 'cornered', 'someone attacked', 'was attacked',
        'getting attacked', 'someone hit', 'someone punched', 'someone stabbed',
        'trying to hurt me', 'wanted to hurt me', 'came after me',
      ]),
    insight: {
      tag: 'Threat simulation: the attacker is the message',
      headline: '66% of all dreams contain threat: your brain is doing exactly what it evolved to do, and who attacks you is the signal',
      text: 'Revonsuo\'s Threat Simulation Theory (2000) provides the evolutionary baseline: dreaming evolved partly as a threat-rehearsal system, and 66.4% of ordinary dream reports contain at least one threatening event. Being attacked is the prototype. But the evolutionary frame only explains why the brain runs these simulations. The identity and behavior of the attacker is where the personal meaning lives.\n\nThe attacker is the entire message:\n\n· A complete stranger attacks: diffuse, non-specific threat anxiety. Your brain has activated a threat signal but cannot attach it to a specific person or situation. This variant correlates most strongly with generalized anxiety, high stress, and periods of environmental uncertainty where something feels unsafe but has not been identified.\n· A known person attacks: the most diagnostically rich variant. What quality defines this person to you? That quality, not the person, is what feels threatening. A trusted person attacking can also encode an emerging awareness of something in a relationship you have not consciously acknowledged.\n· You cannot stop the attacker no matter what: felt helplessness in a waking situation where you cannot change an outcome. The impossibility of defense is the message, not the violence itself.\n· You fight back and succeed: active coping posture. Your brain is rehearsing agency. Often accompanies periods where you are asserting yourself after a period of accommodation.\n· You freeze and cannot respond: dissociative anxiety response. Something threatening is present in your waking life that you have not yet been able to move toward or away from.\n· Being stabbed specifically: one of the most intense vulnerability images. Something has penetrated your defenses. A trust breach, an unexpected blow, something that got through. The location of the wound is often relevant: stabbed in the back = betrayal; in the chest = emotional wound.\n· Being attacked by a crowd or group: institutional or social pressure. Not a personal conflict but a systemic one. You feel ganged up on or unable to fight a force that is diffuse rather than embodied in one person.\n\nWomen are significantly more likely to be victimized in their own dreams than men (Hall content analysis, 1966). This reflects the continuity hypothesis applied to gender-specific threat exposure.',
      citation: 'Revonsuo & Valli (2000), Behavioral and Brain Sciences; Valli & Revonsuo (2005), Consciousness and Cognition; Hall (1966), Content Analysis of Dreams; Hartmann (1995), The Central Image',
      confidence: 0.73,
      epistemic: 'inference',
      reasoning: '66.4% threat prevalence is empirical FACT from Revonsuo content analysis. Attacker-identity breakdowns apply Jungian projection framework and clinical inference. Freeze vs. fight-back as coping correlate is inference, clinically consistent.',
      biasWarning: 'If the dreamer has experienced real-world violence or trauma, threat simulation is primary and symbolic interpretation should be secondary. PTSD-related attack dreams require different clinical framing.',
    },
  },

  // ── Fire ─────────────────────────────────────────────────────────────────────
  {
    detect: d =>
      matchesObjects(d.objects, ['fire', 'flame', 'flames', 'burning', 'smoke', 'wildfire', 'explosion', 'blaze']) ||
      matchesText(d.rawText, [
        'fire', 'on fire', 'burning', 'flames', 'flame', 'explosion', 'smoke', 'wildfire',
        'everything burning', 'house on fire', 'caught fire', 'building on fire',
        'was burning', 'started burning', 'in flames', 'surrounded by fire',
        'forest fire', 'fire spreading', 'couldn\'t stop the fire',
      ]),
    insight: {
      tag: 'Emotional intensity: Central Image',
      headline: 'Fire in dreams maps emotional intensity, not literal events',
      text: 'Ernest Hartmann (Tufts University School of Medicine) identified fire as one of the most common "Central Images": the emotionally charged core image in a dream that metaphorically pictures a dominant waking emotion. His systematic analysis of dreams before and after the 9/11 attacks showed that even people with no direct exposure produced significantly more fire, flood, and disaster imagery: because their emotional state was the driver, not their experience. Fire specifically correlates with feeling overwhelmed, out of control, or consumed by something in waking life. It also has a strong link to anger and rage: the brain uses the same metaphorical language in dreams that it uses in speech.',
      citation: 'Hartmann: The Nature and Functions of Dreaming (Oxford, 2010); PMC2225570: 9/11 Dreams Study',
    },
  },

  // ── Tornado / natural disaster ───────────────────────────────────────────────
  {
    detect: d =>
      matchesObjects(d.objects, ['tornado', 'hurricane', 'earthquake', 'tsunami', 'storm', 'flood', 'disaster', 'avalanche', 'cyclone']) ||
      matchesText(d.rawText, ['tornado', 'hurricane', 'earthquake', 'tsunami', 'storm', 'natural disaster', 'disaster', 'catastrophe', 'destruction', 'everything destroyed', 'apocalypse', 'end of the world']),
    insight: {
      tag: 'Uncontrollable forces',
      headline: 'Disaster dreams track anxiety about forces outside your control',
      text: 'Natural disaster dreams: tornadoes, floods, earthquakes: are consistently linked to anxiety about uncontrollable external forces affecting your life. The metaphor is direct: you cannot stop a tornado, redirect an earthquake, or predict when it hits. Clinically, these dreams spike during periods of anticipated major disruption: job uncertainty, relationship instability, health scares. One counter-intuitive finding: people on the verge of significant positive life changes also report tornado dreams: tornadoes destroy existing structures completely, and the brain may be processing not just fear of loss but readiness for necessary disruption of old patterns.',
      citation: 'Hartmann: Central Image Theory (2010); PMC9655757: Mental Health Impacts of Tornadoes Systematic Review (2022)',
    },
  },

  // ── Sleep paralysis / can't move ─────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['paralyzed', 'couldn\'t move', 'can\'t move', 'couldn\'t scream', 'couldn\'t speak', 'frozen', 'pinned down', 'unable to move', 'tried to move but', 'tried to run but', 'body wouldn\'t', 'woke up and couldn\'t', 'pressing on my chest', 'something on my chest', 'shadow', 'figure in the room']),
    insight: {
      tag: 'Sleep paralysis: REM atonia',
      headline: 'Being paralyzed in a dream has a specific neurological explanation',
      text: 'Paralysis in dreams: especially waking to find you cannot move: is one of the most well-understood dream phenomena neurologically. During REM sleep, the brain suppresses muscle activity (atonia) to prevent you from physically acting out your dreams. Sleep paralysis occurs when this atonia "leaks" into the waking transition: you are partially conscious but your body is still locked in REM suppression. Hallucinations (shadowy figures, pressure on the chest, sounds) accompany about 24% of episodes. A 2024 meta-analysis in Neurology found ~30% of people experience it at least once. It is strongly associated with sleep disruption, stress, irregular schedules, and shift work: not pathology.',
      citation: 'Sharpless & Barber (2011): Sleep Medicine Reviews; Neurology meta-analysis (2024): PMC11344621',
      confidence: 0.92,
      epistemic: 'fact',
      reasoning: 'Paralysis/immobility keywords detected. REM atonia mechanism is fully established neurophysiology. Prevalence (8% isolated, 28% lifetime) is meta-analytically confirmed across 35 studies.',
      biasWarning: 'Low bias risk: physiologically deterministic mechanism. The "intruder / presence" hallucination sub-type is also neurologically explained (hypervigilance during mixed-state).',
    },
  },

  // ── Phone / technology malfunction ───────────────────────────────────────────
  {
    detect: d =>
      matchesObjects(d.objects, ['phone', 'smartphone', 'mobile', 'laptop', 'computer', 'screen']) ||
      matchesText(d.rawText, ['phone', 'couldn\'t call', 'couldn\'t dial', 'screen went black', 'couldn\'t text', 'couldn\'t reach', 'no signal', 'phone not working', 'phone broke', 'couldn\'t send', 'couldn\'t type', 'keyboard', 'wrong number', 'phone kept']),
    insight: {
      tag: 'Communication anxiety',
      headline: 'Phones barely appear in dreams: when they malfunction, it\'s about connection, not technology',
      text: 'Analysis of nearly 16,000 dream reports found that smartphones appear in only 2% of all dreams: remarkably low for a device we spend 4–7 hours a day using. Neuroscientist Brigitte Holzinger (Institute for Consciousness and Dream Research, Vienna) explains why: the dreaming brain encodes the emotional content the phone produces, not the device itself. When phones do appear, they disproportionately malfunction: digits won\'t appear, calls won\'t connect, messages fail to send. This reliably correlates with communication anxiety: feeling emotionally unreachable, unheard, or unable to connect with a specific person. The person you were trying to call is usually more diagnostic than the phone itself.',
      citation: 'Holzinger: Institute for Consciousness and Dream Research, Vienna; Revonsuo: Threat Simulation Theory (2000)',
    },
  },

  // ── Trapped / imprisoned / can't escape ──────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['trapped', 'locked in', 'couldn\'t get out', 'no way out', 'imprisoned', 'jail', 'prison', 'cell', 'stuck', 'couldn\'t escape', 'closed in', 'trapped inside', 'locked door', 'locked room', 'bars', 'cage', 'confined']) &&
      !matchesText(d.rawText, ['animal', 'zoo', 'wildlife']),
    insight: {
      tag: 'Powerlessness: continuity',
      headline: 'Being trapped in a dream mirrors feeling constrained in waking life',
      text: 'Confinement dreams are consistently among the top recurring dream themes in population surveys, and their waking-life correlate is remarkably direct: they track feelings of being trapped in a relationship, career, belief system, or situation with no visible exit. A 2021 PLOS ONE study found a measurable spike in trapped and confinement-themed dreams during COVID-19 lockdowns: tracking the physical restriction in real time. Research on incarcerated people provides an ironic counter-intuitive finding: prisoners do not typically dream of freedom. The continuity hypothesis predicts their dreams instead mirror the monotony of daily confinement: the dreaming brain mirrors reality rather than compensating for it.',
      citation: 'Domhoff (UCSC): Continuity Hypothesis; PLOS ONE (2021): COVID Lockdown Dreams Study (10.1371/journal.pone.0259040)',
    },
  },

  // ── Airplane / plane crash ────────────────────────────────────────────────────
  {
    detect: d =>
      matchesObjects(d.objects, ['plane', 'airplane', 'aircraft', 'flight', 'airport', 'helicopter', 'jet']) ||
      matchesText(d.rawText, ['plane', 'airplane', 'plane crash', 'crashing plane', 'flight', 'flying on a plane', 'aircraft', 'airport', 'turbulence', 'going down', 'plane was falling']),
    insight: {
      tag: 'Anticipated threat: travel anxiety',
      headline: 'A plane crash dream can feel as real as a real crash: that\'s a feature, not a bug',
      text: 'Morewedge & Norton (2009, Journal of Personality and Social Psychology) ran a study with 182 commuters: participants who dreamed of a plane crash on their route rated it as unsettling as an actual crash occurring on that route, and were equally likely to change their travel plans. Dream threat is processed by the same emotional systems as real threat: the prefrontal cortex that distinguishes imagined from real is largely offline during REM. Airplane dreams broadly correlate with anxiety about outcomes outside your control, anticipated transitions, or situations where you have handed control to someone else.',
      citation: 'Morewedge & Norton (2009): Journal of Personality and Social Psychology, 96(2):249; Bulkeley & Kahan (2008): Dreaming',
    },
  },

  // ── Killing someone / being the aggressor ─────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['killed', 'killing', 'i killed', 'murdered', 'i murdered', 'shot someone', 'stabbed someone', 'fought back', 'attacked them', 'i attacked', 'i hurt', 'i fought']),
    insight: {
      tag: 'Protective aggression: creative agency',
      headline: 'Killing in dreams is almost always defensive, and correlates with creative agency',
      text: 'Research by Jonas Mathes (Heinrich-Heine University, Consciousness and Cognition, 2022) found that the vast majority of "offender nightmares" are acts of self-defense: the dreamer kills to protect themselves or others, not from unprovoked aggression. The most surprising finding: creative achievement was a stronger predictor of these dreams than trait aggression or neuroticism. Creative individuals appear to engage more actively with dream threats rather than becoming passive victims. During REM sleep, the amygdala is hyperactive while the prefrontal cortex is largely dormant: mild daytime friction can amplify biologically into high-intensity defensive scenarios without any moral override.',
      citation: 'Mathes et al.: Consciousness and Cognition (2022); Schredl & Mathes (2014): Dreaming (APA)',
    },
  },

  // ── Celebrity / famous person ─────────────────────────────────────────────────
  {
    detect: d =>
      matchesPeople(d.people, ['celebrity', 'famous', 'actor', 'actress', 'singer', 'musician', 'athlete', 'politician', 'president', 'influencer', 'star']) ||
      matchesText(d.rawText, ['celebrity', 'famous person', 'on tv', 'from tv', 'from instagram', 'famous person', 'movie star', 'pop star', 'rock star', 'public figure']),
    insight: {
      tag: 'Parasocial continuity',
      headline: 'You dream about famous people proportionally to how much mental space they occupy',
      text: 'McCutcheon et al. (2021, International Journal of Dream Research) studied cross-cultural celebrity dreaming and found that most adults have experienced at least one dream involving a media figure, with the frequency directly predicted by the strength of waking parasocial attachment: consistent with the continuity hypothesis. The dreaming mind treats parasocial relationships (with celebrities, influencers, characters) as real emotional relationships: the brain has no mechanism to flag them as one-directional. If a famous person occupies significant cognitive bandwidth in your daily media consumption, they will appear in your dreams at rates comparable to real people you interact with.',
      citation: 'McCutcheon, Williams et al. (2021): International Journal of Dream Research, Heidelberg University; Schredl: Continuity Hypothesis',
    },
  },

  // ── Mirror / seeing your own reflection ──────────────────────────────────────
  {
    detect: d =>
      matchesObjects(d.objects, ['mirror', 'reflection', 'glass']) ||
      matchesText(d.rawText, ['mirror', 'my reflection', 'saw myself', 'looking at myself', 'my face', 'didn\'t recognize myself', 'looked different', 'distorted', 'reflection was wrong', 'reflection looked']),
    insight: {
      tag: 'Self-recognition anomaly',
      headline: 'The dreaming brain cannot reliably render its own face: that\'s why mirrors disturb',
      text: 'Mirrors and reflective surfaces are among the most consistent failure points in dream construction. Stephen LaBerge (Stanford) documented that text, clocks, and mirrors all produce unstable, distorted output in dreams: because the brain\'s face-processing regions (fusiform face area) receive no visual input during REM, making stable self-recognition neurologically impossible. A waking parallel: Giovanni Caputo (2010, Perception) found that 70% of normal people experience identity dissociation and hallucinated faces after 10 minutes of mirror-gazing: the same phenomenon the dreaming mind produces automatically. Mirror dreams cluster around identity transitions, new roles, and periods of self-questioning.',
      citation: 'LaBerge: Stanford Sleep Research (1985–2000); Caputo (2010): Perception; Stumbrys: Lucid Dreaming Research',
    },
  },

  // ── Wedding / marriage ────────────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['wedding', 'getting married', 'marriage', 'my wedding', 'wedding day', 'wedding dress', 'fiancé', 'fiancée', 'proposing', 'proposal', 'the altar', 'wedding ceremony', 'reception', 'vows', 'engagement ring', 'bride', 'groom', 'bridesmaids']) ||
      matchesObjects(d.objects, ['wedding ring', 'engagement ring', 'wedding dress', 'altar', 'veil']),
    insight: {
      tag: 'Commitment threshold: union or merger',
      headline: 'Wedding dreams are about commitment and union, not necessarily romantic: what is being merged is the question',
      text: 'Weddings in dreams are commitment thresholds: the moment something is formally, publicly, irreversibly joined. But the union is rarely about the literal marriage. The Jungian reading is precise: a wedding in a dream encodes any merger of previously separate parts. Your own wedding going smoothly encodes readiness to commit to something fully · not always a relationship; more often a career, creative project, identity shift, or value that you are ready to make permanent and public. Your own wedding going wrong (wrong person, wrong venue, late, disaster) encodes ambivalence about a commitment currently being considered · the nature of what goes wrong is specific: wrong person = the commitment is with the wrong entity; running late = not ready; dress not fitting = the identity this commitment requires does not yet feel like yours. Marrying a stranger encodes committing to an unknown part of yourself · the Jungian anima/animus integration, unifying with a quality you have not yet claimed. Being at someone else\'s wedding encodes witnessing a merger you are not part of, or two qualities in yourself that are being unified. A wedding that never happens encodes commitment perpetually deferred · something you are not yet ready to finalize. Research: wedding dreams are significantly more frequent in people approaching major life decisions of any kind, not just romantic ones.',
      citation: 'Domhoff (2003), UCSC DreamBank; Jung, Collected Works Vol. 9i; Van de Castle (1994), Our Dreaming Mind; Nielsen & Zadra, Typical Dream Themes',
      confidence: 0.62,
      epistemic: 'speculation',
      reasoning: 'Wedding/marriage keywords detected. Frequency increase near major decisions is inference-level (Domhoff). Jungian hieros gamos framework is speculation, not empirically tested.',
      biasWarning: 'Moderate projection risk: for people actively planning a wedding, direct continuity is the primary explanation. Symbolic union interpretation applies most strongly where no literal wedding is imminent.',
    },
  },

  // ── Childhood / past settings ─────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['childhood', 'when i was young', 'when i was a kid', 'as a child', 'old school', 'my old school', 'grew up', 'used to live', 'back in my childhood', 'years ago in school', 'from my childhood', 'my childhood home', 'childhood friend', 'my old neighborhood']) &&
      !matchesText(d.rawText, ['wedding', 'married', 'bride', 'groom', 'ceremony', 'reception', 'vows', 'engagement', 'hospital', 'doctor', 'church service', 'funeral']),
    insight: {
      tag: 'Autobiographical template: continuity',
      headline: 'Childhood settings in adult dreams are borrowed scenery, not nostalgia',
      text: 'Research by Domhoff and the DreamBank team shows that childhood schools, homes, and old social settings in adult dreams are almost never about the past itself. They are "concern maps": the dreaming brain borrows familiar emotional environments as templates for present-day feelings. An adult dreaming of their old school is almost always processing current performance anxiety, not a suppressed childhood experience. Schacter & Addis (Harvard, 2007) confirmed this via fMRI: the same default mode network circuits handle both memory retrieval and future simulation, meaning the dreaming brain uses autobiographical scaffolding to model present concerns.',
      citation: 'Domhoff (UCSC): DreamBank Content Analysis; Schacter & Addis (Harvard, 2007): Nature Reviews Neuroscience',
    },
  },

  // ── Erotic / sexual dream ─────────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['sex', 'sexual', 'erotic', 'intimate', 'kissing', 'attracted to', 'naked together', 'slept with', 'hookup', 'desire', 'aroused', 'sensual']),
    insight: {
      tag: 'Erotic dream: continuity + openness',
      headline: 'Erotic dreams are nearly universal and directly reflect waking mental activity',
      text: 'A 2025 study (SLEEP Study, Journal of Behavioral and Brain Science, n=301) found 99.67% of adults had experienced at least one sexual dream: making them the most universally reported dream type. On average, ~18% of all dreams contain sexual content (men ~21%, women ~16%). Schredl et al. (2019, Psychology & Sexuality) found the strongest personality predictor is openness to experience, not waking sexual activity levels. Counter-intuitively, celibacy does not prevent erotic dreams: waking preoccupation, whether acknowledged or suppressed, may actually increase them. Neuroticism specifically makes them more frequent but emotionally negative in tone.',
      citation: 'SLEEP Study: Journal of Behavioral and Brain Science (2025); Schredl et al. (2019): Psychology & Sexuality, Taylor & Francis',
    },
  },

  // ── Social humiliation / mockery / rejection ──────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['laughed at', 'laughing at me', 'mocked', 'humiliated', 'rejected', 'rejection', 'excluded', 'left out', 'ignored', 'invisible to them', 'no one noticed', 'no one listened', 'dismissed', 'judged', 'embarrassed', 'everyone was looking', 'made fun of']) &&
      !matchesText(d.rawText, ['naked', 'undressed']),
    insight: {
      tag: 'Social threat: rejection processing',
      headline: 'Social rejection activates the same brain circuits as physical pain',
      text: 'Research from Oxford\'s SCAN journal (Eisenberger et al.) established that social exclusion activates the dorsal anterior cingulate cortex: the same region as physical pain. Dreams process this as genuine threat content. Tuominen et al. (2022, British Journal of Psychology) found that during social seclusion, dreams shift to feature more emotionally meaningful familiar people: the brain prioritizes depth of attachment bonds over compensating for isolation. The most counter-intuitive finding: when you feel socially rejected in waking life, your dreams don\'t become more socially active: they become more selective, focusing on people who feel safe.',
      citation: 'Eisenberger et al.: SCAN/Oxford (2009) PMC2686232; Tuominen et al. (2022): British Journal of Psychology',
    },
  },

  // ── Being invisible ───────────────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['invisible', 'no one could see me', 'couldn\'t see me', 'no one noticed me', 'i was unseen', 'passed through', 'walked through', 'no one acknowledged', 'as if i wasn\'t there', 'transparent']),
    insight: {
      tag: 'Invisibility: two opposing meanings',
      headline: 'Being invisible in a dream has two opposite meanings; the emotional tone is the key',
      text: 'Invisibility dreams split sharply into two phenomenologically distinct experiences. If the invisibility felt like relief or freedom: moving undetected, observing without judgment: research links this to introversion and desire to escape performance pressure. If it felt lonely, frustrating, or frightening: being unseen by people who matter: it aligns with the social exclusion dream cluster, processing waking experiences of feeling overlooked or dismissed. Unlike flying or falling (which have consistent emotional signatures), invisibility is unusual in that the same scenario maps to opposite psychological states. The emotional tone you woke with is the entire diagnostic signal.',
      citation: 'Levin & Fireman (2001): Imagination, Cognition and Personality; Nielsen & Zadra: Cross-cultural typical dream theme surveys',
    },
  },

  // ── Superpowers / abilities beyond normal ─────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['superpower', 'super strength', 'telekinesis', 'mind control', 'could read minds', 'time stopped', 'stopped time', 'healed', 'healing power', 'breathe underwater', 'run really fast', 'super speed', 'teleport', 'force field', 'magic', 'wizard', 'spell', 'powers', 'ability i don\'t have']),
    insight: {
      tag: 'Agency simulation: evolutionary puzzle',
      headline: 'Superpower dreams are an unsolved puzzle for evolutionary dream theory',
      text: 'Superpower dreams are a genuine scientific anomaly: they are too common and too positive to fit the dominant Threat Simulation Theory (Revonsuo, 2000), which predicts dreaming evolved to rehearse survival responses. They cannot be explained as threat rehearsal. Nielsen & Zadra\'s meta-analysis directly titled their paper "The prevalence of typical dream themes challenges the specificity of the threat simulation theory." A 2019 Consciousness and Cognition study showed that a brief pre-sleep VR flying task significantly increased flying and superpower dream incidence: suggesting these dreams are highly susceptible to environmental priming and may function as agency and competence simulation rather than threat rehearsal.',
      citation: 'Nielsen & Zadra (2000): Behavioral and Brain Sciences; Valli & Revonsuo (2006): Consciousness and Cognition; VR flying study (2019)',
    },
  },

  // ── Blood ─────────────────────────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['blood', 'bleeding', 'wound', 'hemorrhage', 'blood everywhere', 'covered in blood', 'bloody', 'cut open', 'internal bleeding', 'hemorrhaging']),
    insight: {
      tag: 'Life force signal: vitality or loss',
      headline: 'Blood in dreams tracks life energy, not violence: its direction is the message',
      text: 'Blood is the most ancient symbol of life force across all cultures. Bleeding out encodes energy depletion, something draining your vitality · what in your waking life is costing you more than it gives back? Blood on your hands encodes guilt processing, feeling responsible for harm to something or someone (rarely literal). Someone else bleeding encodes anxiety about someone you care for who is struggling or at risk. Blood that will not stop encodes the feeling that a loss or wound is not being addressed, something requiring urgent attention you are avoiding. Blood appearing without wound (bleeding spontaneously) encodes transformation energy in Jungian terms · menstrual symbolism as cyclical renewal regardless of gender. Giving blood willingly encodes self-sacrifice, overextension, the price of a commitment. Research: blood as Central Image (Hartmann) appears most frequently after experiences of emotional violence, not physical.',
      citation: 'Hartmann (1995, 2010), Central Image Theory; Jung, Collected Works; Domhoff (2003), UCSC DreamBank',
      confidence: 0.65,
      epistemic: 'inference',
      reasoning: 'Blood keywords detected. Central Image correlation (Hartmann) is empirically grounded. Specific directional meanings (bleeding out = depletion) are inference-level framework applications.',
      biasWarning: 'If dreamer has recent medical concerns or injury, continuity processing is primary.',
    },
  },

  // ── Hair (loss, cutting, changing) ────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['hair falling out', 'losing my hair', 'hair loss', 'bald', 'went bald', 'shaved my head', 'cutting my hair', 'hair cut off', 'hair changing color', 'long hair', 'short hair', 'hair grew', 'pulled my hair out', 'clumps of hair']),
    insight: {
      tag: 'Identity marker: self-image in transition',
      headline: 'Hair in dreams is one of the most direct markers of identity and social self-image',
      text: 'Hair is one of the most culturally loaded identity markers: the dream brain uses it to process identity, attractiveness, strength, and social presentation. Hair falling out is the most common variant. Research distinguishes this from teeth dreams: while teeth correlate with physical sensation (bruxism), hair loss dreams are more consistently tied to anxiety about losing power, attractiveness, or social standing. Not physiology but identity threat. Cutting hair willingly encodes deliberate shedding of an old identity or social role · what have you recently cut from your life or presentation? This is one of the positive transformation variants. Someone else cutting your hair without permission encodes feeling that your identity or autonomy is being trimmed by external forces · who in the dream held the scissors? Hair growing longer or changing color encodes identity expansion or shift · something new is emerging in how you present or experience yourself. Going bald suddenly encodes acute vulnerability and exposure without the usual protective layer, like nakedness but specifically about social power. Biblical and mythological roots: Samson\'s hair as strength is a near-universal associative layer.',
      citation: 'Schredl (2010), Dreaming; Nielsen et al. (2003), Typical Dream Themes; Bulkeley (2017), An Introduction to the Psychology of Dreaming',
      confidence: 0.64,
      epistemic: 'inference',
      reasoning: 'Hair-related keywords detected. Identity-marker framework is consistently applied across clinical traditions. Hair-loss vs. teeth-loss distinction is inference-level.',
    },
  },

  // ── Voice lost / can\'t speak / mouth won\'t work ─────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ["couldn't speak", "lost my voice", "no voice", "couldn't scream", "couldn't call for help", "words wouldn't come out", "mouth wouldn't open", "voice wouldn't work", "tried to shout", "tried to call out", "voice gone", "mute", "no sound came out", "couldn't say anything", "words came out wrong"]),
    insight: {
      tag: 'Communication block: unexpressed urgency',
      headline: 'Losing your voice in a dream is one of the most direct maps of something important that is not being said',
      text: 'Voice loss dreams have two distinct mechanisms: (1) physiological · during REM, motor output including the vocal apparatus is suppressed, and attempting to speak can produce this experience directly; (2) psychological · when the physiological trigger is absent, voice loss encodes genuine communication urgency blocked by fear, context, or internal conflict. What you were trying to say is the entire message. If you cannot remember, ask what you most need to say to someone right now that you are not saying. Trying to scream for help but no sound comes encodes the distress signal not reaching anyone · felt isolation in a threatening situation, the inability to make your urgency visible to those who could respond. Trying to speak to someone specific but words will not come encodes blocked communication in that specific relationship · something is either unspeakable (too risky), unknown (you do not yet have words for it), or the channel feels closed. Words coming out wrong or garbled encodes articulation anxiety · the fear that even if you speak, you will not be understood. Voice works but no one can hear encodes feeling unheard, invisible in your communication rather than silent in it. Research: REM-related vocal suppression is neurologically confirmed. Psychological voice loss clusters with assertiveness deficits and high-stakes unexpressed communication (Domhoff analysis).',
      citation: 'Domhoff (2003), UCSC DreamBank; Hobson (2009), Nature Reviews Neuroscience; Hartmann (2010), The Nature and Functions of Dreaming',
      confidence: 0.71,
      epistemic: 'inference',
      reasoning: 'Voice-loss keywords detected. REM motor suppression is neurological FACT. Psychological unexpressed-communication framework is inference-level, clinically consistent across multiple traditions.',
    },
  },

  // ── Money / financial anxiety ─────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['money', 'lost all my money', 'broke', 'bankrupt', 'debt', "can't afford", 'financial', 'rich', 'wealthy', 'lottery', 'winning money', 'found money', 'stole money', 'owed money', 'bills', 'poverty', 'lost my job', 'lost everything', 'savings gone']) ||
      matchesObjects(d.objects, ['wallet', 'cash', 'money', 'coins', 'credit card', 'bank', 'safe']),
    insight: {
      tag: 'Resource schema: security and worth',
      headline: 'Money in dreams maps to security, worth, and power, rarely the literal financial situation',
      text: 'Money in dreams is one of the most direct symbols of psychological and social resources: security, value, power, and worth. The continuity hypothesis applies directly in financial crisis contexts; for everyone else, money is almost always metaphorical. Losing all money or going broke encodes fear of losing foundational security · what in your life provides your sense of groundedness and sufficiency? If not literally financial, what resource (relationship, status, role, identity) feels at risk? Finding money unexpectedly encodes discovery of an undervalued resource · something you already have is worth more than you realized. This is one of the rare genuinely positive dream scenarios that is not compensatory. Stealing money or having it stolen encodes violation of what is rightfully yours, or the felt guilt of taking something that is not yours · the specific direction matters. Being wealthy or winning encodes either positive continuity (genuine abundance) or compensatory processing (your waking life feels scarce in some domain, not necessarily financial). Owing money or being in debt encodes the burden of obligations that exceed current capacity · what are you overcommitted to? Research: money dreams increase significantly during economic downturns (continuity) but also appear during non-financial resource scarcity (social capital, creative energy, relational bandwidth).',
      citation: 'Schredl (2003, 2024), Continuity Hypothesis; Domhoff (2003), UCSC DreamBank; Hartmann (2010), The Nature and Functions of Dreaming',
      confidence: 0.63,
      epistemic: 'inference',
      reasoning: 'Money/financial keywords detected. Continuity correlation in financial crisis contexts is empirically supported. Metaphorical resource-mapping is framework-level inference.',
    },
  },

  // ── Hospital / illness / injury / surgery ─────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['hospital', 'doctor', 'sick', 'illness', 'injured', 'injury', 'surgery', 'operation', 'ambulance', 'diagnosis', 'cancer', 'dying of illness', 'in a hospital', 'treatment', 'medical', 'nurse', 'ward', 'emergency', 'stitches', 'broken bone', 'pain']) ||
      matchesObjects(d.objects, ['hospital', 'ambulance', 'syringe', 'scalpel', 'wheelchair', 'stretcher']),
    insight: {
      tag: 'Vulnerability and repair: what needs healing',
      headline: 'Hospital and illness dreams track vulnerability and the need for repair, not prediction',
      text: 'Hospital dreams have two entirely different registers: (1) continuity in people with active health concerns, illness, or medical trauma; (2) symbolic vulnerability and repair processing in people without current medical concerns. For people with active health anxiety or medical experience, the continuity hypothesis is dominant · the emotional tone of the treatment (compassionate vs. cold, effective vs. failing) tracks felt sense of being cared for or abandoned. For people without current medical concerns: you as the patient encodes something needing attention and healing that you have not yet addressed · what is unwell in your psychological, relational, or creative life? You as the doctor or healer encodes an active caretaking role where others depend on your capacity to assess and repair. Surgery or operation encodes something needing to be cut out or restructured at a deeper level than surface change · what requires a more radical intervention than the adjustments you have been making? A specific body part being treated carries the message: heart surgery = emotional life requiring deep repair; brain surgery = a fundamental change in how you think; orthopedic = your support structure. Research: illness dreams increase significantly after periods of intense stress independent of actual illness (Hartmann Central Image research, 2010).',
      citation: 'Hartmann (2010), Central Image Theory; Domhoff (2003), UCSC DreamBank; Valli et al. (2006), Neuroscience and Biobehavioral Reviews',
      confidence: 0.67,
      epistemic: 'inference',
      reasoning: 'Hospital/illness keywords detected. Continuity for health-anxious dreamers is FACT. Symbolic repair framework is inference, clinically consistent across psychodynamic and cognitive traditions.',
      biasWarning: 'If dreamer has active health concerns, illness history, or medical trauma, direct continuity is primary. Symbolic interpretation should not be applied where literal medical anxiety is present.',
    },
  },

  // ── Stairs / elevator (going up or down) ─────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['stairs', 'climbing stairs', 'going up stairs', 'going down stairs', 'elevator', 'lift', 'escalator', 'going up', 'going down', 'descending', 'ascending', 'fell down the stairs', 'stairs that never end', 'elevator going up', 'elevator going down', 'elevator stopped', 'stuck in an elevator']) ||
      matchesObjects(d.objects, ['stairs', 'staircase', 'elevator', 'lift', 'escalator']),
    insight: {
      tag: 'Vertical axis: status, aspiration, descent',
      headline: 'Vertical movement in dreams is one of the most consistent orientation metaphors: up and down carry specific meaning',
      text: 'The vertical axis is among the most universal spatial metaphors in human cognition (Lakoff and Johnson, embodied metaphor theory). We say things are "looking up," "feeling down," "rising to the occasion," "in a low place." The dreaming brain uses architecture to extend this metaphor spatially. Climbing stairs upward encodes aspiration and effort · the quality of the climb matters: easy and flowing = momentum; labored and endless = goal feels unreachable or effort is disproportionate to progress. Descending stairs is not negative by default · descending in dream symbolism often means going deeper into yourself, accessing lower floors of the house-as-psyche. Controlled, deliberate descent is often therapeutic. Falling down stairs differs from walking down: one is controlled exploration, the other is loss of footing. Elevator going up encodes rapid ascent, possibly faster than earned or expected · can encode both aspiration and anxiety about achieving too quickly. Elevator going down encodes entering deeper levels, often unconscious material, or anxiety about going down in status. Elevator stopping between floors encodes being in transition unable to complete · suspended between levels, neither here nor there. Stairs that never end encode effort without visible progress, a specific variant of performance anxiety where work continues but the destination never arrives.',
      citation: 'Lakoff & Johnson (1980), Metaphors We Live By; Jung, Collected Works; Domhoff (2003), UCSC DreamBank; Hartmann (2010), The Nature and Functions of Dreaming',
      confidence: 0.65,
      epistemic: 'inference',
      reasoning: 'Stairs/elevator keywords detected. Embodied metaphor framework (vertical = status) is empirically established in cognitive linguistics. Dream-specific applications are inference-level.',
    },
  },

  // ── Bridge ────────────────────────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['bridge', 'crossing a bridge', 'on a bridge', 'bridge collapsing', 'bridge broke', 'the bridge', 'a narrow bridge', 'bridge over water', 'rickety bridge', 'suspension bridge', 'bridge gave way']) ||
      matchesObjects(d.objects, ['bridge']),
    insight: {
      tag: 'Threshold: crossing between states',
      headline: 'The bridge is the transition symbol: its condition tells you how you feel about what you are crossing toward',
      text: 'The bridge is one of the most structurally clear symbols in all of dream psychology: it connects two different states, shores, or conditions, and you are in the process of crossing. The current question in your waking life is: what are you in the middle of transitioning between? A solid, well-built bridge crossed confidently encodes a supported transition · you have sufficient foundation to make this crossing. Often appears when a decision has been made and the person is in the middle of enacting it. A narrow, rickety, or swaying bridge encodes a precarious transition · the risk of the crossing is high. A bridge that collapses encodes a transition route that has become unavailable · something you were counting on to get from here to there no longer holds. A bridge over water compounds the symbolism: crossing from one emotional state to another, with the risk of falling into the emotional content below. Unable to start crossing or standing at the edge encodes threshold anxiety · the transition is visible and available but not yet begun. A bridge with no visible far side encodes commitment to a transition whose destination is unknown · the unknown shore is part of the test. Research: threshold and crossing imagery clusters with life transition events across Jungian, cognitive, and clinical literature (Hartmann Central Image analysis).',
      citation: 'Hartmann (2010), Central Image Theory; Jung, Collected Works; Domhoff (2003), UCSC DreamBank; Campbell (1949), The Hero With a Thousand Faces',
      confidence: 0.62,
      epistemic: 'speculation',
      reasoning: 'Bridge keywords detected. Threshold symbolism is deeply consistent across analytical traditions. Classification as speculation because direct empirical studies on bridge dream content specifically are absent.',
    },
  },

  // ── Train / subway / bus (public transit) ─────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['train', 'subway', 'metro', 'underground', 'on a train', 'missed the train', 'on the subway', 'train station', 'the platform', 'train was leaving', 'wrong train', 'bus', 'missed the bus', 'wrong stop', 'last stop', 'end of the line', 'delayed train', 'train not coming']) ||
      matchesObjects(d.objects, ['train', 'subway', 'bus', 'tram', 'station', 'platform']),
    insight: {
      tag: "Collective path: on someone else's schedule",
      headline: 'Train dreams encode shared trajectory and the anxiety of being on a path you did not design',
      text: 'Trains and public transit in dreams are structurally different from car dreams. The car is personal agency: you drive, you steer, you control speed. The train follows a fixed track on a fixed schedule: you are a passenger in a system designed by others. This distinction is the key to reading these dreams. On a train moving steadily encodes being on a path determined by forces larger than your individual agency · the emotional tone tells you whether this feels right or constrictive. Missing the train is one of the most common variants · combining missed-event anxiety and path anxiety. You needed to be on a particular trajectory and have fallen behind. Wrong train encodes being on a path but not the right one · movement is happening but the direction is wrong, the sense of being in motion toward the wrong destination. Train not coming or endless waiting on a platform encodes the path you expected to be available having been withdrawn · you are ready to move but the vehicle has not arrived. End of the line or last stop encodes a natural conclusion · whatever trajectory you have been on has reached its terminus. Underground or subway specifically adds the depth dimension of the unconscious: going underground on a predetermined track encodes descent into something structured and beyond personal control.',
      citation: 'Domhoff (2003), UCSC DreamBank; Schredl (2024), Continuity Hypothesis; Hartmann (2010), The Nature and Functions of Dreaming',
      confidence: 0.63,
      epistemic: 'inference',
      reasoning: 'Train/transit keywords detected. Car vs. train agency distinction is a clinically applied inference framework. Missing-the-train correlation with opportunity anxiety is consistent across continuity research.',
    },
  },

  // ── Mountain / climbing / peak ────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['mountain', 'climbing a mountain', 'summit', 'peak', 'top of the mountain', 'the mountain', 'uphill', 'steep climb', 'reached the top', "couldn't reach the top", 'mountainside', 'cliff face', 'rock climbing', 'hiking', 'altitude']) ||
      matchesObjects(d.objects, ['mountain', 'summit', 'cliff', 'peak']),
    insight: {
      tag: 'Ambition arc: the quality of the climb',
      headline: 'The mountain is the ambition or goal: how you climb tells you where you are with it',
      text: 'Mountains are among the most universal symbols of aspiration, challenge, and transcendence across cultures. In dream research, the mountain consistently encodes a significant goal, challenge, or aspiration that requires sustained effort. The quality of the climbing experience is more informative than whether you reach the top. Climbing with difficulty but making progress encodes engaged effort · the challenge is real but the direction is right. Climbing and unable to make progress encodes effort not translating into advancement · either the goal is unreachable as currently approached, or self-sabotage is interrupting forward movement. Reaching the summit encodes genuine achievement processing, or the threshold of achievement anxiety (what comes after reaching the top?) · some people dream of reaching peaks just before major accomplishments and feel empty or exposed rather than triumphant, encoding the fear of what visibility at the top means. A mountain too large to consider climbing encodes the goal feeling overwhelming or disproportionate to current capacity. Falling from a mountain encodes loss of footing on a path that was working · something has disrupted progress at a significant stage. Looking at a mountain from below without climbing encodes awareness of the challenge without yet having committed. Research: aspiration imagery increases during active goal pursuit and also appears as procrastination encoding when a person is avoiding a significant commitment.',
      citation: 'Jung, Collected Works; Hartmann (2010), Central Image Theory; Campbell (1949), The Hero With a Thousand Faces; Bulkeley (2017), An Introduction to the Psychology of Dreaming',
      confidence: 0.61,
      epistemic: 'inference',
      reasoning: 'Mountain/climbing keywords detected. Aspiration-metaphor mapping is a consistent cross-cultural inference framework. Empirical specificity is limited; classification as inference.',
    },
  },

  // ── Religious / spiritual / divine ───────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['god', 'jesus', 'allah', 'buddha', 'angel', 'demon', 'devil', 'satan', 'heaven', 'hell', 'church', 'temple', 'mosque', 'synagogue', 'religious', 'spiritual', 'divine', 'holy', 'sacred', 'prayer', 'praying', 'afterlife', 'ghost', 'spirit', 'possessed', 'haunted', 'apparition']) ||
      matchesObjects(d.objects, ['church', 'temple', 'cross', 'altar', 'bible', 'angel', 'devil']),
    insight: {
      tag: 'Numinous encounter: moral or transcendent processing',
      headline: 'Religious and spiritual dream content is among the most emotionally intense and personally significant',
      text: 'Spiritual and religious imagery in dreams produces some of the most emotionally powerful and memorable experiences reported in dream research. Kelly Bulkeley\'s extensive cross-cultural analysis found that religious dream content is reported as distinctly more meaningful and impactful than ordinary dream content, regardless of the dreamer\'s waking religious beliefs. God or a divine figure appearing is among the most significant dream experiences psychologically · the figure embodies ultimate authority, ultimate acceptance, or ultimate judgment, depending on the dreamer\'s internalized relationship with that concept. What did the figure say or do? The message, even fragmented, is worth attention. Angels in clinical terms most often represent guidance, protection, or a sense that something is being watched over · for secular dreamers, the angel figure encodes the idealized helpful presence. Demons or dark spiritual figures encode the shadow made maximally threatening · the dreaming brain has given the darkest unacknowledged material its most frightening possible form. What would this figure say if it could speak? Heaven often encodes a state of perfect resolution, completion, or peace that the dreamer is either approaching or intensely missing. Hell encodes the dreamer\'s own personalized version of what constitutes unbearable suffering or punishment · who else is there, and for what? Being possessed or haunted encodes something external having taken up residence in your inner space · an idea, relationship dynamic, fear, or belief system driving behavior that does not feel authentically yours. Research: Bulkeley (2016) cross-cultural study found religious dream content reported in 28% of all adults regardless of religious affiliation.',
      citation: 'Bulkeley (2016), Big Dreams: The Science of Dreaming and the Origins of Religion; Jung, Collected Works (numinosity); Nielsen & Zadra, Typical Dream Themes; Domhoff (2003), UCSC DreamBank',
      confidence: 0.60,
      epistemic: 'inference',
      reasoning: 'Religious/spiritual keywords detected. Prevalence (28%) is Bulkeley survey data. Specific symbolic breakdowns are framework-level inference across Jungian and clinical traditions.',
      biasWarning: 'High cultural and personal variability: religious imagery is the most individually variable category in the entire rule library. The same symbol carries opposite meanings across different faith traditions and personal histories.',
    },
  },

  // ── Food / eating / hunger / feast ───────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['food', 'eating', 'hunger', 'hungry', 'feast', 'starving', "couldn't eat", 'food disappeared', 'eating too much', 'delicious', 'meal', 'dinner', 'cooking', 'baking', 'restaurant', "can't stop eating", 'no food', 'feeding', 'swallowing']) ||
      matchesObjects(d.objects, ['food', 'meal', 'feast', 'restaurant', 'kitchen', 'table', 'plate']),
    insight: {
      tag: 'Appetite and nourishment: what you are hungry for',
      headline: 'Food dreams map to appetite, nourishment, and what you are or are not receiving in your emotional life',
      text: 'Food in dreams operates on two levels: literal continuity (your body is hungry, or you ate something unusual before sleep) and metaphorical nourishment (what you are starving for, what you are consuming, what is feeding or depleting you). Discriminating between them requires attention to whether you are hungry or full when you wake. Hunger in the dream or inability to get food encodes a need not being met · the hunger maps to a genuine lack in waking life: emotional nourishment, creative stimulation, recognition, rest, intimacy. Food that disappears before you can eat encodes something you need perpetually just out of reach · the frustration of proximity without access. Eating but feeling unsatisfied no matter how much is a common variant encoding the experience of consuming things that do not nourish · activities, relationships, or inputs that fill the schedule but do not fill the person. A feast or abundant food encodes either genuine abundance processing or compensatory processing of scarcity · the emotional quality of the feast (relaxed and shared vs. anxious and alone) is the discriminator. Cooking for others encodes care, provision, the role of nurturer · joyful cooking = genuine investment; compelled cooking = obligation. Being unable to eat despite wanting to encodes blockage between desire and fulfillment. Eating something disgusting or wrong encodes incorporating something harmful · absorbing an influence, belief, or input that you recognize as not good for you. Research: food dreams increase with dietary restriction and caloric deficit (physiological continuity) and also appear in people experiencing emotional deprivation without any dietary restriction.',
      citation: 'Schredl (2003, 2024), Continuity Hypothesis; Freud, Interpretation of Dreams (wish-fulfillment); Domhoff (2003), UCSC DreamBank; Hartmann (2010), The Nature and Functions of Dreaming',
      confidence: 0.64,
      epistemic: 'inference',
      reasoning: 'Food/eating keywords detected. Dietary restriction correlation is physiological FACT. Metaphorical nourishment framework is inference, consistent across clinical traditions.',
    },
  },

  // ── Darkness / blindness / can\'t see ─────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['darkness', 'dark', "couldn't see", 'went blind', 'lost my sight', 'pitch black', 'everything went dark', 'total darkness', 'blinded', "eyes wouldn't open", "couldn't see anything", 'dark room', 'searching in the dark', 'blind', 'no light', 'darkness around me']) &&
      !matchesText(d.rawText, ['outer space', 'night sky', 'stars', 'nighttime']),
    insight: {
      tag: 'Visibility lost: confronting the unknown',
      headline: 'Darkness in dreams is not about night: it is about navigating without the information you need',
      text: 'Darkness in dreams has a different register from nighttime settings. Night is a context; darkness is a condition. The distinction: in nighttime dreams you can still see. In darkness dreams, vision is specifically denied. This denial of visual information is the psychologically active element. Sudden darkness falling encodes something that was comprehensible becoming opaque · information you were relying on has been withdrawn. A situation has become unreadable. What just became unclear in your waking life? Searching in the dark for something encodes knowing what you need but being unable to find it · the locus of uncertainty is specific. Being afraid in the dark encodes fear of the unknown, the threat specifically unidentifiable, which is often more frightening than a named threat. Moving through darkness calmly encodes a more advanced psychological posture · the capacity to navigate without complete information, to move forward without full visibility. This is a competence dream in disguise. Going blind suddenly encodes acute loss of the capacity to perceive something clearly · who or what have you lost the ability to see as it actually is? Can also encode the emotional experience of being betrayed by a trusted perception. Eyes that will not open encode wanting to see but being unable to · something in your environment requires more seeing than you are currently giving, but resistance, avoidance, or exhaustion is preventing it.',
      citation: 'Hartmann (2010), Central Image Theory; Domhoff (2003), UCSC DreamBank; Jung, Collected Works; Bulkeley (2017), An Introduction to the Psychology of Dreaming',
      confidence: 0.63,
      epistemic: 'inference',
      reasoning: 'Darkness/blindness keywords detected. Absence of visual information as "opacity of situation" is a clinical inference framework. Not empirically isolated from general threat-content studies.',
    },
  },

  // ── Old friends / people from the past / reunion ──────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['old friend', 'someone i used to know', "haven't seen in years", "hadn't seen in years", 'old classmate', 'school friend', 'someone from my past', 'a friend i lost touch with', 'reunion', 'growing up', 'years ago', 'from when i was young', 'an old colleague', 'someone who moved away']) &&
      !matchesText(d.rawText, ['childhood home', 'old school', 'exam', 'test', 'wedding', 'married', 'bride', 'groom', 'ceremony', 'reception', 'marriage']),
    insight: {
      tag: 'Past self: schema reactivation',
      headline: 'People from your past appear in dreams when a current situation activates the emotional schema from that relationship',
      text: 'People you have not thought about consciously for years appearing in your dreams is one of the most disorienting and commonly reported dream experiences. Research consistently shows this is not random: the dreaming brain selects from your entire biographical memory the emotional template that most precisely matches what you are currently experiencing. The person represents their emotional role in your life at that time, not their current self. An old school friend who appeared at a moment of social belonging arrives when you are currently feeling socially adrift. A former mentor arrives when you are facing a situation requiring guidance. A childhood enemy arrives when you are currently experiencing something that activates the same felt threat. The quality they embodied is the clue · what do you most associate with this person? What emotion did they reliably produce in you? That emotional quality is what is currently active in your waking life, just in a different container. A reunion with someone who rejected or hurt you encodes old wound reactivated · something in your current life is activating the same relational dynamic. A reunion that feels warm and positive encodes longing for something that person represented · a quality of connection, belonging, or simplicity that is currently missing. Research: autobiographical memory and future simulation share the same neural substrate (Schacter & Addis, 2007), which is why the brain uses past emotional templates to model present and future concerns.',
      citation: 'Schacter & Addis (2007), Nature Reviews Neuroscience; Domhoff (2003), UCSC DreamBank; Schredl (2024), Continuity Hypothesis; Jung, Collected Works',
      confidence: 0.69,
      epistemic: 'inference',
      reasoning: 'Old friend/past person keywords detected. Schema reactivation via autobiographical memory is empirically grounded (Schacter 2007). Specific emotional-template mapping is clinical inference.',
    },
  },

  // ── Can\'t find keys / locked out / lost important item ───────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['lost my keys', "can't find my keys", 'locked out', 'lost my wallet', 'lost my bag', 'lost my purse', 'lost my passport', 'lost my phone', "can't find my phone", 'something important is missing', 'lost my ticket', 'misplaced', 'left it somewhere', "couldn't find it anywhere", 'losing something important']),
    insight: {
      tag: 'Access anxiety: blocked entry',
      headline: 'Losing keys or being locked out is one of the most direct continuity maps of blocked access in waking life',
      text: 'Keys, wallets, passports, and access documents in dreams represent access: the means by which you enter spaces, prove identity, and move freely through your life. Losing them, or being locked out, encodes a felt loss of access to something important. Lost keys specifically encode the most common variant · keys open doors. What door in your waking life feels currently locked or inaccessible? What requires a key you cannot find? This can be literal (access to resources, opportunities, information) or relational (access to a person, a relationship, a part of yourself). Locked out of your own home is the most psychologically loaded variant · your own home is your self (house = psyche). Being locked out of it encodes alienation from your own inner life, feeling like a stranger in your own psychology, or having lost connection with who you fundamentally are. Lost wallet or passport encodes identity documents and financial access · what aspect of your identity or financial security feels uncertain or at risk? An item you know you had but cannot locate encodes the certainty that it exists but inability to find it · you know the resource is there but cannot access it, often encoding gifts, capacities, or relationships you know you have but cannot currently reach. Searching endlessly without finding encodes a specific futility · you may be looking in the wrong places for something that requires a different approach.',
      citation: 'Domhoff (2003), UCSC DreamBank; Schredl (2003, 2024), Continuity Hypothesis; Hartmann (2010), The Nature and Functions of Dreaming',
      confidence: 0.65,
      epistemic: 'inference',
      reasoning: 'Lost keys/locked out keywords detected. Continuity with access anxiety is a consistent clinical inference. Locked-out-of-home as self-alienation applies house = psyche framework.',
    },
  },

  // ── Moving / new home / relocation ───────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['moving house', 'moving to a new place', 'new home', 'new apartment', 'new city', 'relocating', 'packing', 'unpacking', 'boxes', 'new neighborhood', 'moving in', 'moving out', 'leaving home', 'settling in', 'new room', 'new place to live']) &&
      !matchesText(d.rawText, ['hidden room', 'secret room', 'discovered a room']),
    insight: {
      tag: 'Transition: self in new territory',
      headline: 'Moving dreams map to identity transitions: the new home is a new version of yourself under construction',
      text: 'Moving dreams draw directly on the house = psyche framework. If the house is the self, then moving house is undergoing significant identity restructuring. The state of the move, the condition of the new home, and the emotional tone of leaving tell you where you are in the transition. Excited about a new home encodes genuine readiness for identity change · something new in how you inhabit yourself, your role, or your life is being welcomed rather than resisted. The new home being damaged, wrong, or disappointing encodes the new identity or situation having not met expectations · something about where you are going feels less adequate than what you imagined. Unable to finish packing encodes not being ready to leave · what are you holding onto from your current life, role, or identity that you cannot pack away? The things you cannot bring yourself to box up are what you are most reluctant to let go of. Moving into a very large, expansive home encodes a positive expansion · something about the new version of your life feels significantly larger than what you currently occupy. Moving back to an old home encodes regression anxiety or nostalgia activation · something from a previous life stage feels relevant again, either as comfort or as warning. The logistics failing (truck breaks, movers do not show) encodes the practical mechanisms for a transition not being in place · your readiness for change exceeds your infrastructure for achieving it.',
      citation: 'Jung, Collected Works (house = psyche); Roesler (2020), Journal of Analytical Psychology; Domhoff (2003), UCSC DreamBank; Hartmann (2010), The Nature and Functions of Dreaming',
      confidence: 0.61,
      epistemic: 'inference',
      reasoning: 'Moving/relocation keywords detected. House-as-psyche framework is Jungian INFERENCE with empirical structural support (Roesler 2020). Specific moving-state breakdowns are inference-level applications.',
    },
  },

  // ── Reading / writing / words don\'t make sense ───────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['reading', "couldn't read", "words didn't make sense", 'the text kept changing', "couldn't understand the words", 'writing', "couldn't write", 'wrote something', 'a letter', 'a message', 'a book', 'the words were wrong', 'text was blurry', "couldn't decipher", 'coded message', 'gibberish']) ||
      matchesObjects(d.objects, ['book', 'letter', 'note', 'text', 'message', 'scroll']),
    insight: {
      tag: 'Language instability: REM text anomaly',
      headline: 'The dreaming brain cannot reliably read or write: when text appears, it is a direct window into unconscious communication',
      text: 'Text and language are among the most neurologically unstable elements in all of dreaming. Stephen LaBerge\'s lucid dreaming research at Stanford confirmed that text in dreams almost always changes on re-reading · because the language centers of the brain (Broca\'s and Wernicke\'s areas) are partially suppressed during REM. This is why clocks will not show consistent times and written text morphs. This is a neurological FACT, not symbolism. However, when a letter, message, or book appears in a dream with a strong emotional charge, even if the specific words are unreadable, the emotional register of what the communication contains is often preserved · the content is inaccessible but the feeling of what it means is intact. A letter you cannot read encodes a message you need but cannot access · from whom? The sender is often more informative than the content. Words that keep changing encode the situation you are trying to understand being genuinely unstable · the reality is shifting and your brain is encoding that instability. Writing but words coming out wrong encodes the gap between what you want to communicate and what emerges · articulation failure, the inability to adequately externalize something internal. A book with all the answers encodes the wish for complete, organized knowledge about a situation · what is the subject of the book? Being unable to read something important encodes information you need being there but inaccessible · a decision requiring data you do not yet have. Research: language processing during REM is measurably reduced. Text instability is one of the primary reality-testing cues used in lucid dreaming induction.',
      citation: 'LaBerge (Stanford, 1985-2000), Lucid Dreaming Research; Hobson (2009), Nature Reviews Neuroscience; Domhoff (2003), UCSC DreamBank',
      confidence: 0.72,
      epistemic: 'fact',
      reasoning: 'Reading/writing keywords detected. Text instability in REM is neurological FACT confirmed by lucid dreaming research (LaBerge). Emotional content preservation without lexical access is inference-level.',
    },
  },

  // ── Aliens / UFOs / extraterrestrial ─────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['alien', 'aliens', 'ufo', 'extraterrestrial', 'spaceship', 'invasion', 'abduction', 'abducted', 'outer space', 'space travel', 'another planet', 'being taken', 'strange beings', 'not human', 'otherworldly']) ||
      matchesObjects(d.objects, ['spaceship', 'ufo', 'alien', 'rocket']),
    insight: {
      tag: 'The radically other: confronting the unknown',
      headline: 'Alien dreams encode encounters with the radically unfamiliar: something in your life that operates by completely different rules',
      text: 'Alien and extraterrestrial dreams are a modern mythological form: they carry the psychological load that in previous centuries was carried by gods, demons, and supernatural encounters. Psychologically, the alien represents the utterly unfamiliar · something that does not operate by any rules you know. Benevolent aliens or peaceful encounters encode encountering something profoundly different that is not hostile · often accompanies periods of opening to perspectives, belief systems, or people who are genuinely unlike anything in the dreamer\'s existing framework. Alien invasion or hostile takeover encodes external forces operating by incomprehensible rules threatening the familiar order · what in your waking life feels like it is being invaded by something alien to your values, your culture, or your understanding? Being abducted encodes being taken against your will by a superior force · loss of autonomy to something you cannot negotiate with. Often encodes experiences of powerlessness against institutional, systemic, or relational forces that feel alien and beyond appeal. Space travel to another world encodes exploratory contact with the completely unknown · a journey beyond all familiar maps, often a creative or existential dream rather than an anxiety dream. Alien observation or being studied encodes feeling scrutinized by something that does not fully understand what it is seeing · a cold, analytical gaze that can encode experiences of objectification. Research: alien abduction experience during sleep is now well-characterized neurologically as a sleep paralysis variant with hypnagogic hallucination, contributing to perceived abduction experiences in clinical populations.',
      citation: 'McNally & Clancy (2005), Harvard, Psychological Science; Hartmann (2010), The Nature and Functions of Dreaming; Bulkeley (2016), Big Dreams; Jung (1959), Flying Saucers: A Modern Myth',
      confidence: 0.57,
      epistemic: 'speculation',
      reasoning: 'Alien/UFO keywords detected. Alien abduction as sleep paralysis variant is neurological FACT (McNally 2005). Symbolic breakdowns are speculation: alien dream content has minimal direct empirical research.',
    },
  },

  // ── Garden / flowers / nature scenes (not threatening) ───────────────────────
  {
    detect: d =>
      (matchesText(d.rawText, ['garden', 'flowers', 'blooming', 'blossoming', 'beautiful garden', 'park', 'meadow', 'field of flowers', 'overgrown garden', 'tending garden', 'wilting', 'dead flowers', 'plants growing', 'green', 'nature', 'trees', 'forest walk', 'peaceful nature', 'beautiful landscape']) ||
      matchesObjects(d.objects, ['garden', 'flowers', 'roses', 'meadow'])) &&
      !matchesText(d.rawText, ['dark forest', 'lost in the woods', 'jungle', 'threatening', 'attacked', 'predator']),
    insight: {
      tag: 'Growth and tending: what is cultivated or neglected',
      headline: 'Garden and nature scenes map to what you are cultivating or allowing to wither',
      text: 'Gardens in dreams are one of the few genuinely positive symbol categories with a consistent cross-cultural meaning: the garden is what has been deliberately cultivated. Unlike wild nature (which encodes the unconscious), the garden is tended nature · the relationship between the person and their own growth. A beautiful, blooming garden encodes something in your life flourishing · what have you been cultivating that is now in full expression? This is a dream worth noting: it is positive continuity, a brain state of genuine abundance and growth processing. An overgrown, neglected garden encodes something that once required tending having been abandoned · weeds are ideas, habits, relationships, or parts of yourself that have grown without direction. What in your inner life or waking life has been left unattended? Tending a garden encodes the act of cultivation · you are in a caring, patient, developmental relationship with something. Dead or wilting plants encode loss of vitality in something you valued · what has died or is dying? Finding unexpected flowers encodes discovering beauty or value you did not plant · gifts, talents, or connections that appeared without deliberate effort. A garden that is too perfect or controlled encodes over-managed nature, control anxiety applied to organic processes · what in your life are you trying to over-control? Research: positive nature imagery in dreams is associated with wellbeing indicators and typically appears more in people reporting high life satisfaction (Domhoff DreamBank analysis).',
      citation: 'Domhoff (2003), UCSC DreamBank; Jung, Collected Works; Bulkeley (2017), An Introduction to the Psychology of Dreaming; Hartmann (2010), The Nature and Functions of Dreaming',
      confidence: 0.60,
      epistemic: 'inference',
      reasoning: 'Garden/flower keywords detected, excluding threatening nature contexts. Positive nature/wellbeing correlation is inference-level. Cultivation symbolism is consistent cross-cultural inference.',
    },
  },

  // ── Time pressure / running out of time / clock ───────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, ['running out of time', 'not enough time', 'clock', 'time is running out', 'counting down', 'deadline', 'timer', 'too late', 'time was running', 'seconds left', 'no time', 'time running', 'race against time', 'watched the clock', 'clock was wrong', "couldn't stop the clock", 'time moved strangely', 'time was speeding up', 'slow motion']) ||
      matchesObjects(d.objects, ['clock', 'timer', 'countdown', 'watch', 'hourglass']),
    insight: {
      tag: 'Temporal anxiety: scarcity of time',
      headline: 'Time dreams encode pressure, urgency, and mortality: the clock is whatever you feel you are running out of',
      text: 'Time and clocks are neurologically unstable in dreams (like text, they typically fail to display accurate times in REM) but when they appear with emotional weight, they encode temporal anxiety with precision. The experience of time pressure in a dream is among the most direct mappings of waking urgency. Running out of time with a deadline approaching combines performance-anxiety and missed-event patterns · what specific thing do you feel you are behind on, or that is approaching faster than your readiness? A countdown timer encodes the most acute form · something is being counted down to conclusion. What is ending, whether by choice or by circumstance? Clocks showing wrong times or time moving strangely encode the structure of time itself having become unreliable · a sense that your life is not moving at the right pace, or that the normal rules of sequence (effort leading to progress, time producing results) have broken down. Time moving too slowly encodes suspension, stagnation · something is not moving at the rate it should. Time moving too fast encodes overwhelm · the accelerating feeling that everything is happening faster than you can manage, often accompanying genuinely overscheduled periods. Being unable to stop a clock encodes existential mortality processing · the irreversibility of time and loss. Often appears during significant age transitions (30, 40, 50), health scares, or moments when the finitude of something becomes visible. Research: time distortion in REM sleep is well-established neurologically. Clock instability is a primary lucid dreaming reality-testing cue. Urgency encoding maps directly to waking cognitive load and deadline pressure.',
      citation: 'LaBerge (Stanford, 1985-2000), Lucid Dreaming Research; Hobson (2009), Nature Reviews Neuroscience; Domhoff (2003), UCSC DreamBank; Hartmann (2010), Central Image Theory',
      confidence: 0.70,
      epistemic: 'inference',
      reasoning: 'Clock/time keywords detected. Time distortion in REM is neurological FACT. Deadline-pressure correlation with waking urgency is empirically supported continuity inference. Countdown-as-mortality-processing is Jungian/existential inference.',
    },
  },

  // ── Toilet / bathroom (privacy, release, blocked need) ───────────────────────
  {
    detect: d =>
      matchesText(d.rawText, [
        'toilet', 'bathroom', 'no toilet', 'couldn\'t find a toilet', 'public toilet',
        'dirty toilet', 'toilet was broken', 'toilet was exposed', 'needed to pee',
        'needed to go', 'couldn\'t find a bathroom', 'restroom', 'couldn\'t use the bathroom',
        'toilet flooded', 'overflowing toilet', 'looking for a toilet', 'searching for a toilet',
        'no privacy in the bathroom', 'toilet with no walls', 'exposed toilet',
      ]) &&
      !matchesText(d.rawText, ['bath', 'shower', 'bathtub']),
    insight: {
      tag: 'Blocked release: private need denied',
      headline: 'Toilet dreams are about the need to release something privately, and not being able to',
      text: 'Finding no toilet, encountering a dirty or broken one, or being unable to find privacy are among the most universally reported dream scenarios. The physiological explanation (literal bladder pressure during sleep) should be checked first: are you dehydrated or did you need the bathroom during the night? That is the most common cause and the most benign.\n\nFor vivid or recurring toilet dreams without physical urgency, the symbolic layer is consistent across clinical traditions: the toilet is the private release mechanism. The dream encodes a blocked need to let something go.\n\nThe specific context is the signal:\n\n· Cannot find a usable toilet: something needs to be released but the right context or permission is missing. What are you trying to let go of that lacks the right time, place, or audience?\n· A public or exposed toilet with no walls: something private is being forced into a public context. What do you need to process or release that feels at risk of being witnessed without your consent?\n· Broken or overflowing toilet: the release mechanism has failed entirely. Something is backing up, accumulating, or flooding out in an uncontrolled way. What has not been released for too long?\n· Dirty or repulsive toilet: the process of release feels contaminated or shameful. Something you need to let go of carries shame or disgust.\n\nResearch: toilet dreams occur in approximately 6-8% of all dream reports and are among the top-20 most common dream scenarios worldwide (Nielsen et al., 2003).',
      citation: 'Freud, Interpretation of Dreams (1900); Nielsen et al. (2003), Dreaming; Domhoff (2003), UCSC DreamBank',
      confidence: 0.62,
      epistemic: 'inference',
      reasoning: 'Toilet/bathroom keywords detected. Physical continuity (bladder pressure) is the first explanation to eliminate. Blocked-release framework for non-physiological variants is inference-level, consistent across clinical traditions.',
      biasWarning: 'Physiological explanation first: if you woke needing to use the bathroom, that is primary. Symbolic release interpretation applies most strongly to vivid or recurring toilet dreams without physical urgency.',
    },
  },

  // ── Feces / excrement ─────────────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, [
        'poop', 'feces', 'excrement', 'defecating', 'dung', 'fecal', 'bowel movement',
        'stepped in poop', 'covered in feces', 'poop everywhere', 'defecated',
        'crap everywhere', 'mess of feces',
      ]),
    insight: {
      tag: 'Elimination: releasing what is no longer needed',
      headline: 'Feces in dreams encode what you are finishing with and need to release',
      text: 'Dreams involving excrement are among the most common and most underreported dream scenarios. The body processes and eliminates what it has extracted value from; dreams of feces encode the psychological equivalent: what has been processed and is now ready to be released?\n\nThe specific context is the signal:\n\n· Defecating normally: healthy elimination. Something is being released that has been sufficiently processed. Often a positive signal, the completion of an internal cycle.\n· Defecating in public or in the wrong place: something private is being exposed or released in an inappropriate context. What intimate process feels like it is happening without the privacy it requires?\n· Stepping in feces unexpectedly: encountering something messy and unpleasant you did not anticipate. Something you walked into without knowing its true nature.\n· Feces everywhere, overflowing: accumulation that has exceeded containment. What has been piling up that needs to be eliminated but has been retained past its natural release point?\n· Being covered in feces: feeling contaminated by something you want to eliminate but cannot get clean of.\n\nCross-cultural note: in many traditions, feces in dreams is interpreted as a money or abundance omen. The psychological grounding: both money and feces are accumulated, retained, controlled, and released, and social shame around both varies dramatically by context.',
      citation: 'Freud, Interpretation of Dreams (1900); von Franz, Shadow and Evil in Fairy Tales (1974); Domhoff (2003), UCSC DreamBank',
      confidence: 0.55,
      epistemic: 'inference',
      reasoning: 'Excrement keywords detected. Elimination-as-psychological-release is consistent across Freudian and Jungian frameworks. Cultural money-omen association noted. Physiological triggering should be eliminated first.',
    },
  },

  // ── Crying / tears ────────────────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, [
        'crying', 'i cried', 'i was crying', 'tears', 'sobbing', 'wept', 'weeping',
        'burst into tears', 'couldn\'t stop crying', 'started crying', 'cried in my dream',
        'tears running', 'cried uncontrollably', 'someone was crying', 'they were crying',
        'i cried and', 'was sobbing', 'tears down my face', 'cried myself',
      ]),
    insight: {
      tag: 'Emotional release: completing unfinished grief',
      headline: 'Crying in dreams is the brain completing an emotional process that was not finished while awake',
      text: 'Crying in dreams is one of the most emotionally significant and commonly undervalued dream experiences. Unlike waking tears, which are often suppressed by social context, the dreaming brain processes grief, loss, relief, and accumulated emotional weight without the same inhibitory systems. Matthew Walker\'s overnight therapy model explains why people often wake from crying dreams feeling lighter, not heavier: the emotional charge has been partially processed.\n\nThe specific context carries the meaning:\n\n· Crying at something specific (a loss, a person): the brain is completing grief or emotional processing around that specific person, event, or quality. Waking with relief rather than continued sadness suggests the process is working.\n· Crying uncontrollably or unable to stop: accumulated emotional weight that has not found expression in waking life. The volume of tears tracks the volume of what has not yet been felt or expressed.\n· Crying but not knowing why: the most common variant. Something is being processed that the conscious mind has not named. The feeling is real; the narrative explanation is absent. This often precedes waking recognition.\n· Someone else crying: anxiety about that person\'s emotional state, or projection: an emotion you have not claimed in yourself being expressed by a proxy figure.\n· Crying tears of joy or relief: completion of a long tension. Something being endured or worked toward has reached a resolution point.\n\nResearch: crying dreams are significantly more frequent in people experiencing grief, stress, or significant transition. They are also elevated in people who have difficulty expressing emotion while awake, suggesting a compensatory release mechanism.',
      citation: 'Walker, Why We Sleep (2017); van der Helm & Walker (2009), Nature Neuroscience; Hartmann (2010), The Nature and Functions of Dreaming; Schredl (2024), Continuity Hypothesis',
      confidence: 0.70,
      epistemic: 'inference',
      reasoning: 'Crying/tears keywords detected. Overnight therapy model (Walker) provides the primary framework. REM emotional processing is empirically established. Crying-as-release inference is clinically consistent.',
      biasWarning: 'If you woke with actual tears, this may be physiological tear production during REM. Both the literal physiological process and the symbolic emotional processing may be simultaneously active.',
    },
  },

  // ── Theft / being robbed / stolen from ───────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, [
        'stolen', 'robbed', 'robbery', 'stole', 'someone stole', 'they stole', 'theft',
        'thief', 'pickpocket', 'burglar', 'break-in', 'broke into my', 'my stuff was gone',
        'my belongings were taken', 'i was robbed', 'they took my', 'taken from me',
        'stolen from me', 'i stole', 'i took something', 'shoplifting', 'i shoplifted',
      ]) &&
      !matchesText(d.rawText, ['stole the show', 'stole my heart', 'stolen moments']),
    insight: {
      tag: 'Violation: something rightfully yours was taken',
      headline: 'Being robbed in a dream encodes feeling that something rightfully yours is being appropriated',
      text: 'Theft dreams consistently appear in population surveys as one of the more common criminal-scenario dreams. The psychological framework is direct: what was stolen is the signal. Your brain uses the theft scenario to encode any experience of something being taken from you without consent.\n\nWhat was taken is the message:\n\n· Your wallet or money stolen: financial security or sense of worth is threatened. Something that defines your capacity to operate in the world is at risk.\n· Your phone or car stolen: the theft of access or agency. Something that enables you to connect, communicate, or move freely has been removed by another\'s action.\n· Your identity documents (passport, ID): vulnerability to someone having access to who you are. Can encode situations where your sense of self feels at risk of being defined by others.\n· A treasured personal item: something carrying emotional meaning is being violated. What the item represents is what feels threatened.\n· You are the thief: you may be acquiring something that does not fully feel like yours to have. This encodes impostor syndrome (taking credit that feels unearned), competitive guilt, or desire for something currently out of reach by legitimate means.\n· The thief is someone you know: the quality that person represents is what is taking from you in waking life.\n\nResearch: theft dreams correlate with periods of feeling that something important, time, energy, attention, or recognition, is being appropriated by others without reciprocity.',
      citation: 'Domhoff (2003), UCSC DreamBank; Nielsen et al. (2003), Dreaming; Hartmann (2010), The Nature and Functions of Dreaming',
      confidence: 0.61,
      epistemic: 'inference',
      reasoning: 'Theft/robbery keywords detected. Violation-of-ownership framework is consistent across clinical traditions. Specific item-as-symbol breakdown is inference-level.',
    },
  },

  // ── Police / arrested / authority figure ─────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, [
        'police', 'cop', 'cops', 'officer', 'arrested', 'being arrested', 'arrest',
        'being chased by police', 'chased by cops', 'handcuffed', 'detained', 'interrogated',
        'law enforcement', 'security guard', 'authorities came',
      ]) &&
      !matchesText(d.rawText, ['i am a police', 'i was a cop', 'i worked as a cop', 'i was an officer']),
    insight: {
      tag: 'Internalized authority: the inner judge',
      headline: 'Police in dreams represent your own internalized authority and rule system, not external law',
      text: 'Police and law enforcement figures in dreams are one of the most consistent Jungian symbols of the superego: the internalized authority that monitors, judges, and enforces the rules you have absorbed from your upbringing, culture, and social environment. They are rarely about actual legal concerns.\n\nThe specific scenario carries the meaning:\n\n· Being chased or arrested by police: you are doing something that violates your own internalized rules. Not necessarily something externally illegal; more often something you have told yourself you should not be doing, wanting, or feeling. The pursuit encodes the inner critic closing in.\n· Being interrogated: something you have been concealing from yourself or others is being brought to the surface. The question being asked is the one you are avoiding.\n· Escaping from police: part of you is successfully defying an oppressive internal rule. What prohibitions are you currently breaking free from?\n· Being arrested unfairly: you feel held to a standard that is not just. Where in your life does judgment feel disproportionate to what you have actually done?\n· Police who are corrupt or threatening: the internalized authority has become tyrannical. The inner critic has moved beyond reasonable self-regulation into punitive self-suppression.\n· Police who are helpful: the internal authority is constructive. Boundaries and rules are providing safety rather than oppression.\n\nResearch: authority-figure dreams (police, judge, parent) are consistently elevated during periods of guilt, moral conflict, and when the dreamer is transgressing their own values.',
      citation: 'Jung, Collected Works Vol. 9ii (superego); Hall & Van de Castle (1966), Content Analysis of Dreams; Domhoff (2003), UCSC DreamBank; Hartmann (2010), The Nature and Functions of Dreaming',
      confidence: 0.63,
      epistemic: 'inference',
      reasoning: 'Police/authority keywords detected. Police-as-superego framework is consistent across Jungian and psychodynamic traditions. Chased-by-police as guilt-encoded-pursuit is clinical inference.',
      biasWarning: 'For people with real-world police trauma or ongoing legal concerns, continuity processing is primary and symbolic interpretation should not be applied.',
    },
  },

  // ── Snow / ice / winter ───────────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, [
        'snow', 'snowing', 'snowstorm', 'blizzard', 'ice', 'icy road', 'frozen ground',
        'winter', 'freezing cold', 'frost', 'glacier', 'avalanche', 'buried in snow',
        'everything was white', 'white landscape', 'walking on ice', 'ice cracked',
      ]) &&
      !matchesText(d.rawText, ['ice cream', 'iced coffee', 'ice cube', 'ice pack', 'dry ice']),
    insight: {
      tag: 'Stillness and suspension: the frozen state',
      headline: 'Snow and ice in dreams encode stillness, suspension, or emotional freezing',
      text: 'Snow and winter landscapes carry a distinct quality absent from other natural elements: silence and suspension. Unlike water, which flows and transforms, snow halts and preserves. The psychological register is consistent: snow encodes a pause, a suspended state, or something that has been frozen rather than flowing forward.\n\nThe specific quality of the snow carries the meaning:\n\n· Beautiful, peaceful snow: a genuine stillness that is welcome. Rest, clarity, purification. A temporary pause with positive valence. Often accompanies periods of deliberate rest or creative incubation.\n· A blizzard or snowstorm: disorienting, blinding conditions. Something in your environment has become so overwhelming that you cannot see or navigate clearly.\n· Being buried or trapped in snow: immobility from accumulation. Something has been piling up around you until movement has become impossible. Not a locked door but a slow entombment.\n· Ice (frozen water): emotions that have been frozen rather than flowing. Water is emotion; ice is emotion stopped. What has stopped moving in your inner life that needs to thaw?\n· Avalanche: a sudden, unstoppable release of something that has been accumulating. The force has exceeded containment capacity and is now moving on its own terms.\n· Walking on ice: navigating something that requires extreme care and could break without warning. A precarious situation where the wrong move has significant consequences.\n\nResearch: cold and winter imagery in dreams correlates with emotional withdrawal, numbness, and periods of deliberate restriction or isolation (Hartmann Central Image analysis).',
      citation: 'Hartmann (2010), Central Image Theory; Jung, Collected Works; Domhoff (2003), UCSC DreamBank; Bulkeley (2017), An Introduction to the Psychology of Dreaming',
      confidence: 0.59,
      epistemic: 'inference',
      reasoning: 'Snow/ice keywords detected. Frozen-water-as-frozen-emotion framework is Jungian inference consistently applied in clinical settings. Blizzard-as-overwhelm and avalanche-as-uncontrolled-release are Central Image framework applications.',
    },
  },

  // ── Clothing / getting dressed / wrong outfit ────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, [
        'clothes', 'clothing', 'outfit', 'getting dressed', 'wrong clothes', 'couldn\'t find clothes',
        'clothes didn\'t fit', 'wearing the wrong', 'inappropriate clothes', 'formal clothes',
        'costume', 'uniform', 'what i was wearing', 'i was dressed', 'my clothes',
        'clothes were wrong', 'dressed up', 'couldn\'t get dressed', 'dressed inappropriately',
      ]) &&
      !matchesText(d.rawText, ['naked', 'undressed', 'wedding dress', 'no clothes', 'no shirt', 'no pants']),
    insight: {
      tag: 'Persona: the face you show the world',
      headline: 'Clothing in dreams encodes the persona: the self you present to different audiences',
      text: 'Clothing in dreams is the most direct symbol of persona, the Jungian term for the social mask: the face you present to different audiences in different contexts. You are not naked (that encodes the self stripped of all masks) but you are wearing something, and what you wear matters.\n\nThe specific scenario is the signal:\n\n· Wrong clothes for the context (formal when casual, casual when formal): a mismatch between who you are presenting yourself as and what the situation actually requires. Does the role you are in fit the self underneath it?\n· Clothes that don\'t fit: the identity you are currently wearing does not quite accommodate who you actually are. Either you have grown past the clothes, or you have not yet grown into them.\n· Can\'t find the right outfit: anxiety about how to present yourself in a context that matters. The right persona for a situation feels unavailable.\n· Wearing a costume or uniform: playing a role deliberately. The costume tells you which role. If worn willingly, it feels authentic. If forced or uncomfortable, the role is a constriction.\n· Clothes are ragged, dirty, or torn: how you are presenting yourself feels depleted or inadequate. Social self-image has taken damage.\n· Wearing beautiful, perfectly fitting clothes: persona and self in alignment. The outer presentation accurately represents the inner state.\n\nResearch: clothing and appearance dreams cluster with social evaluation situations and are significantly more frequent in people experiencing role transitions or social identity uncertainty.',
      citation: 'Jung, Collected Works (persona); Hall & Van de Castle (1966), Content Analysis of Dreams; Domhoff (2003), UCSC DreamBank; Schredl (2010), Dreaming',
      confidence: 0.63,
      epistemic: 'inference',
      reasoning: 'Clothing keywords detected, excluding nudity. Persona-as-clothing is Jungian inference consistently applied across clinical traditions.',
    },
  },

  // ── Shoes / footwear ──────────────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, [
        'shoes', 'my shoes', 'the shoes', 'boots', 'heels', 'barefoot', 'no shoes',
        'wrong shoes', 'shoes didn\'t fit', 'lost my shoes', 'couldn\'t find my shoes',
        'new shoes', 'old shoes', 'broken shoes', 'shoe fell off', 'shoes were gone',
      ]),
    insight: {
      tag: 'Foundation: how you stand and move through your life',
      headline: 'Shoes in dreams encode the foundation beneath you and your readiness for the terrain ahead',
      text: 'Shoes are the interface between self and ground: they determine how you make contact with the world you are walking through. In dream symbolism, shoes encode your foundation, your stance, and your sense of being appropriately equipped for the terrain you are navigating.\n\nThe specific scenario is the signal:\n\n· Barefoot or no shoes: direct contact with the ground without protection. Dual meaning depending on emotional tone: vulnerability on difficult terrain; or authentic, grounded contact when the ground is safe. What is the quality of what you are walking on?\n· Shoes that don\'t fit: the current path or role does not fit who you are. Either you have outgrown it, or you have not yet grown into it.\n· Lost shoes or can\'t find shoes: not feeling equipped to move forward. The foundation for your next step is missing.\n· Wrong shoes for the terrain: your current approach is mismatched to the demands of the situation. What you brought is not what this situation requires.\n· New shoes: a new direction, a new way of moving through the world. Something is being tried on. How do the new shoes feel?\n· Broken or falling-apart shoes: the foundation for your movement through a particular domain is failing. What has been holding you up is no longer reliable.\n\nResearch: shoes appear in approximately 3-5% of dream reports and consistently track foundational concerns about readiness, path, and identity-in-motion.',
      citation: 'Jung, Collected Works; Domhoff (2003), UCSC DreamBank; Bulkeley (2017), An Introduction to the Psychology of Dreaming',
      confidence: 0.55,
      epistemic: 'speculation',
      reasoning: 'Shoes/footwear keywords detected. Shoe-as-foundation framework is Jungian and cross-cultural inference. Classified as speculation due to limited direct empirical research on shoe dream content specifically.',
    },
  },

  // ── Door / doorway / entrance ─────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, [
        'a door', 'the door', 'locked door', 'open door', 'closed door', 'doorway',
        'door won\'t open', 'door was locked', 'behind the door', 'through the door',
        'couldn\'t open the door', 'door that opened', 'knocked on the door', 'at the door',
        'door slammed', 'door closed', 'many doors', 'corridor of doors', 'wrong door',
        'door appeared', 'door led to',
      ]) &&
      !matchesText(d.rawText, ['next door neighbor', 'door-to-door', 'front door of my house']),
    insight: {
      tag: 'Threshold: opportunity or boundary',
      headline: 'Doors in dreams are thresholds between where you are and where you could be',
      text: 'Doors are among the most architecturally significant symbols in dream psychology: they represent the boundary between one state and another, one room and the next, one version of yourself and what lies beyond.\n\nThe state of the door is everything:\n\n· An open door: an opportunity or passage currently available. The question is whether you walk through it.\n· A closed but unlocked door: something available but not yet entered. The resistance to crossing is internal, not structural.\n· A locked door: access is denied or not yet earned. What is behind this door, and what would give you the key?\n· A door that will not open despite appearing unlocked: a passage that should be available but is practically blocked. Something is preventing entry that should not be.\n· Knocking and waiting: access to a space or person requires another\'s invitation. You cannot enter on your own terms.\n· A door that slams shut: a threshold that has just closed. An opportunity or phase no longer available.\n· Multiple doors or a corridor of doors: choice overload. Many potential paths without obvious direction. The right door is not clear.\n\nResearch: threshold and door imagery clusters with decision-making periods, transitions, and moments of opportunity awareness across Jungian and cognitive dream research.',
      citation: 'Jung, Collected Works; Hartmann (2010), Central Image Theory; Campbell (1949), The Hero With a Thousand Faces; Domhoff (2003), UCSC DreamBank',
      confidence: 0.60,
      epistemic: 'inference',
      reasoning: 'Door/doorway keywords detected. Door-as-threshold is a highly consistent symbolic framework across cultures and analytical traditions.',
    },
  },

  // ── Suitcase / luggage / packing ──────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, [
        'suitcase', 'luggage', 'packing my bags', 'packing a bag', 'packed my bags',
        'can\'t pack', 'too much luggage', 'heavy luggage', 'lost luggage', 'lost my suitcase',
        'can\'t close the suitcase', 'overpacked', 'forgot to pack', 'carry-on bag',
        'travel bag', 'packing for a trip', 'my luggage', 'the suitcase',
      ]) &&
      !matchesText(d.rawText, ['moving house', 'moving to a new', 'relocating']),
    insight: {
      tag: 'Emotional cargo: what you carry from the past',
      headline: 'Luggage in dreams is the psychological cargo you carry from one life phase into the next',
      text: 'Suitcases and luggage encode what you bring with you: the emotional and psychological cargo you carry from one life phase into the next. The condition of the luggage and your ability to manage it tells you your current relationship to your own history, commitments, and burdens.\n\nThe specific scenario is the signal:\n\n· Can\'t close or finish packing the suitcase: more than you can contain or integrate. Something has to be left behind, and the difficulty is choosing what.\n· Too heavy to carry: the burden of what you are carrying is disproportionate to your current strength. Something manageable has become too much.\n· Lost luggage: something you brought from your past has been separated from you in transit. What from your history do you no longer have access to?\n· Forgetting to pack: arriving at a new phase without something important from the past. What have you left behind that you still need?\n· Packing carefully with ease: the transition is manageable. You know what to bring and what to leave. A sign of readiness.\n· Someone else carrying your luggage: dependence in managing your own history. Who is carrying things for you, and for how long?\n\nResearch: luggage and packing dreams cluster with transition periods and major life changes, particularly when the question of what to take forward and what to release is active.',
      citation: 'Jung, Collected Works; Domhoff (2003), UCSC DreamBank; Hartmann (2010), The Nature and Functions of Dreaming; Schredl (2024), Continuity Hypothesis',
      confidence: 0.60,
      epistemic: 'inference',
      reasoning: 'Suitcase/luggage keywords detected. Luggage-as-psychological-cargo is a consistent clinical inference. Transition-period clustering follows the continuity hypothesis.',
    },
  },

  // ── Cave / underground space ──────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, [
        'cave', 'cavern', 'underground space', 'in a tunnel', 'dark tunnel',
        'went underground', 'below ground', 'a cave', 'the cave', 'inside a cave',
        'exploring a cave', 'cave entrance', 'cave walls', 'hiding in a cave', 'into the earth',
        'underground chamber', 'subterranean', 'dark cavern',
      ]) &&
      !matchesText(d.rawText, ['subway', 'metro', 'underground train', 'tube station']),
    insight: {
      tag: 'Descent into the deep self',
      headline: 'A cave in dreams is the descent into the oldest and deepest parts of the self',
      text: 'The cave is one of the oldest and most cross-culturally consistent symbols in human psychology. Every mythological tradition places important encounters underground: the hero descends before they ascend, the shaman goes below before receiving knowledge, the oracle speaks from a subterranean space. The cave represents the deep unconscious: what is most ancient, most instinctual, and most outside the reach of ordinary consciousness.\n\nThe experience within the cave is the message:\n\n· Entering a cave willingly: deliberate descent into the self. You are choosing to go deeper rather than remaining on the surface. What are you seeking in the dark?\n· Being trapped in a cave: forced containment with something you usually avoid. The unconscious material has become the environment.\n· A cave that opens into unexpected space or light: the discovery that what was feared contains its own interior richness. Something you thought was just darkness has depth and illumination.\n· Prehistoric cave paintings or ancient artifacts: contact with something very old in your own psychology or in the collective human inheritance.\n· Cave as shelter or hiding: using the deep self as protection from an external threat. What are you retreating from?\n· Something living in the cave: a symbol of what the unconscious contains. What does the cave-dweller represent to you?\n\nResearch: cave and underground imagery in dreams is consistently associated with deep psychological exploration and encounters with the pre-conscious in Jungian literature.',
      citation: 'Jung, Collected Works Vol. 9i (descent symbolism); Campbell (1949), The Hero With a Thousand Faces; Hartmann (2010), Central Image Theory; Domhoff (2003), UCSC DreamBank',
      confidence: 0.58,
      epistemic: 'speculation',
      reasoning: 'Cave/underground keywords detected, excluding subway/metro. Descent-as-unconscious is a cross-cultural mythological framework with strong Jungian consistency. Classified as speculation: direct empirical research on cave dream content is very limited.',
    },
  },

  // ── Bath / shower / cleansing ─────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, [
        'taking a bath', 'taking a shower', 'in the bath', 'in the shower',
        'having a shower', 'having a bath', 'washing myself', 'washing my body',
        'couldn\'t get clean', 'still dirty after washing', 'washed it off',
        'cleansing myself', 'scrubbing myself', 'soap', 'lather', 'bathtub',
      ]),
    insight: {
      tag: 'Purification: washing the emotional slate',
      headline: 'Bathing in dreams encodes the desire or need for purification and emotional cleansing',
      text: 'Bathing and cleansing imagery is among the most cross-culturally consistent symbolic categories in human dreaming, present in virtually every religious and mythological tradition. Water purifies; the act of bathing represents the desire to wash something away.\n\nThe specific scenario is the message:\n\n· Showering or bathing normally: routine purification. Processing and releasing the emotional residue of recent experience. Something is being washed off that is not deeply entrenched.\n· Unable to get clean despite repeated washing: guilt, shame, or contamination that resists ordinary cleansing. Something has touched you internally that cannot be reached by external action. The most psychologically significant variant. What do you feel you cannot wash off?\n· Someone else bathing you: being cleansed by another\'s care. A gesture of nurturing, or a situation where you are in a dependent, receiving role.\n· Bathing in impure or murky water: the cleansing medium is itself contaminated. Attempting to purify yourself with something that is not clean.\n· A cold shower: deliberate, harsh self-clarification. Something uncomfortable but intentional you are doing to yourself.\n· A bath that overflows: the process of cleansing has exceeded containment. Purification spilling beyond its intended scope.\n\nResearch: bathing dreams correlate with moral distress, guilt processing, and the psychological need to mark a transition between a burdened state and a fresh start. They are elevated after situations involving shame, ethical conflict, or the desire to begin again.',
      citation: 'Hartmann (2010), Central Image Theory; Jung, Collected Works; Domhoff (2003), UCSC DreamBank; Bulkeley (2017), An Introduction to the Psychology of Dreaming',
      confidence: 0.60,
      epistemic: 'inference',
      reasoning: 'Bath/shower/cleansing keywords detected. Purification-as-emotional-release is consistent across Jungian, religious, and clinical frameworks. Inability-to-get-clean as guilt encoding is inference-level.',
    },
  },

  // ── Vampire / energy drain ────────────────────────────────────────────────────
  {
    detect: d =>
      matchesText(d.rawText, [
        'vampire', 'vampires', 'vampire bite', 'vampiric', 'blood sucker',
        'draining my blood', 'sucking my blood', 'becoming a vampire',
        'a vampire appeared', 'vampire was', 'attacked by a vampire',
      ]),
    insight: {
      tag: 'Energy drain: the relationship that takes',
      headline: 'Vampires in dreams encode relationships or situations that drain vitality without reciprocating',
      text: 'Vampire imagery is a modern mythological form that crystallizes one of the most psychologically specific relational dynamics: the drain. Unlike the generic attacker, the vampire takes something specific (blood = life force) and cannot be confronted by ordinary means. This specificity makes the vampire symbol unusually precise.\n\nThe scenario encodes:\n\n· Being bitten or drained: a relationship, dynamic, or situation extracting your energy, time, or emotional resources without reciprocal nourishment. Who or what is feeding on your vitality? The vampire often has a recognizable quality pointing to the waking-life source.\n· A vampire you recognize: the draining dynamic is personified. What quality does this person represent? Often encodes narcissistic or manipulative relational patterns.\n· Becoming a vampire yourself: are you in the position of the drain? Or is this a shadow integration dream: claiming the vampire\'s power (immortality, magnetism, strength) without its predatory cost?\n· Unable to stop a vampire by conventional means: the draining situation has no straightforward solution. What is extracting from you that you cannot simply end?\n· A vampire who is seductive: the most complex variant. Something that drains you is also compelling. What are you drawn to that costs more than it gives?\n\nResearch: vampire imagery tracks clinically with narcissistic relationship dynamics, energy-depleting commitments, and situations where the drain is real but socially difficult to name or exit.',
      citation: 'Jung, Man and His Symbols (1964, shadow); Hartmann (2010), Central Image Theory; Domhoff (2003), UCSC DreamBank',
      confidence: 0.56,
      epistemic: 'inference',
      reasoning: 'Vampire keywords detected. Energy-drain relational dynamic framework is a clinical inference applied across psychodynamic traditions. Modern mythological form analysis is inference-level.',
    },
  },

  // ── Emotion-based fallbacks ───────────────────────────────────────────────────
  {
    detect: d => d.emotions.includes('anxious') || d.emotions.includes('fearful'),
    insight: {
      tag: 'Emotional memory consolidation',
      headline: 'Your REM sleep was actively reducing the charge of stressful memories',
      text: 'During REM sleep, norepinephrine: a stress neurochemical: is suppressed. This creates a window in which the brain can re-process emotionally charged memories without re-triggering the stress response. Dreams during this phase often feel anxious precisely because the brain is working through high-charge material. Recording the dream continues this process.',
      citation: 'Walker et al.: UC Irvine / Scientific Reports (2024); van der Helm & Walker (2009)',
    },
  },
  {
    detect: d => d.emotions.includes('sad') || d.emotions.includes('angry'),
    insight: {
      tag: 'Emotional memory trade-off',
      headline: 'Engaging with this dream now reduces its emotional charge',
      text: 'People who record and reflect on negative-emotion dreams show measurably reduced emotional reactivity to those same memories the following day. Your brain is using sleep to process the emotional payload: writing it down extends that process into waking. The negative emotion in the dream is the processing cost, not a signal that something is wrong.',
      citation: 'Schredl (2003, 2024): Continuity Hypothesis; Walker (2017): Why We Sleep',
    },
  },
  {
    detect: d => d.emotions.includes('curious') || d.emotions.includes('excited'),
    insight: {
      tag: 'Default mode network',
      headline: 'Your brain was in its most integrative mode',
      text: 'Positive, curious dreams are generated primarily in the default mode network: the neural system responsible for self-reflection, future simulation, and creative connection-making. This is the same network active during your best ideas. Dreams in this state tend to integrate disparate memories and are disproportionately associated with creative insights on waking.',
      citation: 'Domhoff (2022): Neurocognitive Model; Cai et al. (2009): PNAS',
    },
  },
  {
    detect: d => d.emotions.includes('happy'),
    insight: {
      tag: 'Positive affect consolidation',
      headline: 'Positive dreams reinforce wellbeing: and you can influence them',
      text: 'Positive dream content is directly linked to positive pre-sleep experiences and intentions. Brief, specific intention-setting before sleep measurably shifts dream emotional content over two weeks. Tonight\'s check-in directly feeds this mechanism.',
      citation: 'Frontiers in Sleep (2025); Schredl (2024)',
    },
  },

  // ── Default ──────────────────────────────────────────────────────────────────
  {
    detect: () => true,
    insight: {
      tag: 'Continuity hypothesis',
      headline: 'Your dream content reflects your most active waking concerns',
      text: 'The continuity hypothesis: one of the most replicated findings in sleep research: shows that dream content directly mirrors what you think about, feel, and experience while awake. The more cognitively or emotionally present something is in your waking life, the more likely it is to appear in your dreams. Logging consistently over several weeks will make these connections visible as patterns.',
      citation: 'Schredl (2003, 2024): Continuity Hypothesis',
    },
  },
]

// ── IPA Questions ──────────────────────────────────────────────────────────────
// Integrated Personality Approach: bridge dream emotion to waking life
// One focused question per dream: where does this feeling live right now?

interface IPAQuestion {
  prompt: string     // the main question
  subtext: string    // brief framing (1 line, not preachy)
}

const IPA_RULES: { detect: (d: MorningEntryDraft) => boolean; question: IPAQuestion }[] = [

  // ── Self-death ───────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['i died', 'i was dead', 'i was dying', 'i got killed', 'i was killed', 'my own death', 'died in my dream', 'died in the dream', 'killed me', 'i stopped breathing', 'watched myself die', 'saw myself dead']),
    question: { prompt: 'What version of yourself feels like it is ending right now? What identity, role, or way of being has run its course and needs to end?', subtext: 'Your own death in a dream is never about mortality. It is about what needs to end so something new can begin.' }},

  // ── Death of others ─────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['my mother died', 'my mom died', 'mother died', 'mom died', 'mum died']),
    question: { prompt: 'Your mother died in the dream. What pattern of emotional dependency, nurturing, or self-criticism that you associate with her is currently transforming in your life?', subtext: 'The mother figure encodes your relationship to sustenance, belonging, and the inner critic.' }},

  { detect: d => matchesText(d.rawText, ['my father died', 'my dad died', 'father died', 'dad died']),
    question: { prompt: 'Your father died in the dream. What internalized standard, authority, or judgment are you currently moving beyond or redefining for yourself?', subtext: 'The father figure encodes your relationship to performance, authority, and self-approval.' }},

  { detect: d => matchesText(d.rawText, ['my child died', 'my son died', 'my daughter died', 'baby died', 'child died']),
    question: { prompt: 'A child died in the dream. What responsibility, creative project, or vulnerable part of yourself feels at genuine risk right now?', subtext: 'A child dying rarely predicts loss. It processes intense protective anxiety about something fragile in your care.' }},

  { detect: d => matchesText(d.rawText, ['died', 'death', 'dead', 'dying', 'funeral', 'killed']) && !matchesText(d.rawText, ['undead', 'zombie', 'i died', 'i was dead', 'i was dying', 'i got killed', 'i was killed', 'i stopped breathing']),
    question: { prompt: 'Who died in the dream: and what one quality most defines that person to you? It is that quality, not the person, that is currently transforming in your life.', subtext: 'The identity of who died points directly to what is changing.' }},

  // ── Chase ───────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['couldn\'t run', 'legs wouldn\'t move', 'legs stopped working', 'frozen', 'couldn\'t move', 'legs gave out']),
    question: { prompt: 'You were frozen and couldn\'t run. Where in your waking life do you feel unable to act, escape, or respond to something that feels threatening?', subtext: 'Paralysis in a chase encodes felt helplessness, not physical danger.' }},

  { detect: d => matchesText(d.rawText, ['was caught', 'got caught', 'they caught me', 'caught me', 'couldn\'t escape']),
    question: { prompt: 'You were caught. Something you have been avoiding has now made contact. What conversation, situation, or part of yourself has finally caught up with you?', subtext: 'Being caught is often the most productive chase outcome.' }},

  { detect: d => matchesText(d.rawText, ['chasing', 'chased', 'running from', 'following me', 'pursued', 'running away', 'escape', 'someone was chasing', 'something was chasing', 'being hunted', 'ran away from']),
    question: { prompt: 'What quality does the pursuer represent to you — not who they were, but what they stand for? That quality is what you are running from in yourself.', subtext: 'A faceless pursuer is unnamed anxiety. A known person is a quality you have projected onto them.' }},

  // ── Falling ─────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['void', 'endless fall', 'into darkness', 'fell into nothing', 'no ground', 'abyss']),
    question: { prompt: 'You fell into a void with no ground in sight. Where do you feel the most profound uncertainty right now — an area of your life with no visible floor or resolution?', subtext: 'A void fall encodes the absence of any stable reference point, not danger.' }},

  { detect: d => matchesText(d.rawText, ['never landed', 'didn\'t land', 'kept falling', 'still falling', 'falling and falling']),
    question: { prompt: 'You never landed. What situation in your life has been unresolved for a long time — falling without an outcome, suspended between states?', subtext: 'No landing means no conclusion. Something is waiting to resolve.' }},

  { detect: d => matchesText(d.rawText, ['fell off', 'fell from', 'off a building', 'off a cliff', 'off a bridge', 'off the edge', 'fell down the stairs']),
    question: { prompt: 'You fell from something solid. What position, relationship, or foundation that felt secure has recently given way beneath you?', subtext: 'Falling from a structure encodes loss of a previously stable footing.' }},

  { detect: d => matchesText(d.rawText, ['falling', 'fell down', 'plummeting', 'dropping', 'tumbling']),
    question: { prompt: 'Where in your life do you feel like you are losing your footing right now — what is no longer as stable as it was?', subtext: 'Falling tracks instability, not danger.' }},

  // ── Flying ──────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['effortless', 'joyful', 'freely', 'soaring', 'gliding', 'incredible', 'amazing', 'felt amazing', 'so free', 'euphoric']),
    question: { prompt: 'You flew effortlessly. What in your waking life right now gives you that same sense of freedom, expansion, or flow? If nothing does — what would?', subtext: 'Effortless flight maps to genuine felt freedom or creative momentum.' }},

  { detect: d => matchesText(d.rawText, ['struggling', 'couldn\'t stay up', 'too heavy', 'kept falling', 'hard to fly', 'laboured', 'difficult to fly', 'couldn\'t get high', 'barely flying']),
    question: { prompt: 'You struggled to stay airborne. What specifically is weighing you down or draining your energy right now — what is the gap between where you want to be and where you feel able to get?', subtext: 'Laboured flight maps to aspiration blocked by something specific.' }},

  { detect: d => matchesText(d.rawText, ['crashed', 'fell from flying', 'couldn\'t control', 'spinning', 'out of control in the air']),
    question: { prompt: 'The flight ended badly. What plan, project, or trajectory that you have invested in feels like it is failing or has crashed?', subtext: 'A flight crash is distinct from falling. It encodes a specific direction that failed.' }},

  { detect: d => matchesText(d.rawText, ['flying', 'flew', 'floating', 'levitating', 'hovering', 'airborne', 'weightless', 'could fly']),
    question: { prompt: 'How did flying feel — free and easy, or effortful and unstable? That feeling quality maps precisely to something in your waking life. What domain does it point to?', subtext: 'The quality of flight is the entire message.' }},

  // ── House / rooms ───────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['basement', 'cellar', 'underground room', 'below the house', 'underground', 'subterranean']),
    question: { prompt: 'You were in the basement. What do you keep below the surface — what do you know about yourself that you deliberately avoid looking at?', subtext: 'The basement is the part of the self below conscious attention.' }},

  { detect: d => matchesText(d.rawText, ['attic', 'loft', 'top of the house', 'roof space']),
    question: { prompt: 'You were in the attic. What from your past is being reactivated by something in your current life — what stored memory or old pattern is relevant right now?', subtext: 'The attic holds the past. Its reactivation is rarely nostalgic.' }},

  { detect: d => matchesText(d.rawText, ['hidden room', 'secret room', 'new room', 'discovered a room', 'found a room', 'extra room', 'rooms i didn\'t know', 'room i hadn\'t seen']),
    question: { prompt: 'You discovered a room you didn\'t know was there. What capacity, aspect of yourself, or opportunity have you recently become aware of that you haven\'t yet claimed or entered?', subtext: 'A hidden room is almost always a newly available part of self.' }},

  { detect: d => matchesText(d.rawText, ['childhood home', 'house i grew up in', 'parents\' house', 'old family home', 'my old house', 'house from my childhood']),
    question: { prompt: 'It was your childhood home. What early identity pattern or way of relating — from that time in your life — is being reactivated by something happening now?', subtext: 'The childhood home is borrowed emotional scenery, not nostalgia.' }},

  { detect: d => matchesText(d.rawText, ['crumbling', 'falling apart', 'damaged house', 'broken house', 'collapsing', 'walls were crumbling', 'house was broken']),
    question: { prompt: 'The house was damaged or crumbling. What foundational aspect of your life or sense of self feels structurally unstable right now?', subtext: 'The condition of the house is the most reliable psychological indicator.' }},

  { detect: d => matchesText(d.rawText, ['house', 'room', 'building', 'home', 'apartment', 'mansion', 'cabin', 'flat']),
    question: { prompt: 'What was the condition and feeling of the space — familiar or strange, intact or damaged, expanding or confining? That quality is a map of your current psychological state.', subtext: 'The house is the self. Its condition tells you more than its rooms.' }},

  // ── Water ───────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['calm', 'clear water', 'peaceful water', 'still water', 'crystal clear', 'beautiful water', 'serene', 'tranquil']),
    question: { prompt: 'The water was calm and clear. What has recently resolved or settled for you — what are you clearer about now than you were recently?', subtext: 'Calm water maps to emotional clarity or integration.' }},

  { detect: d => matchesText(d.rawText, ['murky', 'dark water', 'muddy', 'cloudy water', 'can\'t see the bottom', 'opaque', 'murky water']),
    question: { prompt: 'The water was murky or dark. What are you deliberately not looking at right now — what would become visible if the water cleared?', subtext: 'Murky water maps to something unexamined or suppressed.' }},

  { detect: d => matchesText(d.rawText, ['flood', 'flooding', 'rising water', 'water rising', 'water level', 'being swept', 'overwhelmed by water', 'wave hit me', 'tidal wave', 'tsunami']),
    question: { prompt: 'The water was rising or sweeping you. What obligation, emotion, or situation is currently escalating beyond your capacity to contain it?', subtext: 'Rising water is the hallmark of overwhelm. What is building?' }},

  { detect: d => matchesText(d.rawText, ['turbulent', 'rough water', 'choppy', 'storm', 'rapids', 'current', 'dragged', 'pulled', 'struggling in water']),
    question: { prompt: 'The water was turbulent and difficult. Name the specific source of the conflict or chaos you are currently in — not the general feeling, but the specific situation.', subtext: 'Turbulent water maps to active conflict, not background anxiety.' }},

  { detect: d => matchesText(d.rawText, ['swimming well', 'swimming easily', 'good swimmer', 'swimming competently', 'swam across', 'made it across']),
    question: { prompt: 'You were swimming competently through difficult water. Where in your life are you currently navigating something hard with more skill than you expected?', subtext: 'Competent swimming is a resilience signal.' }},

  { detect: d => matchesText(d.rawText, ['drowning', 'underwater', 'submerged', 'can\'t breathe', 'sinking', 'pulled under', 'held underwater']),
    question: { prompt: 'You were drowning or submerged. What specific situation or emotional weight is currently overwhelming you — what are you being pulled under by?', subtext: 'Drowning is the most intense overwhelm signal in dream research.' }},

  { detect: d => matchesText(d.rawText, ['ocean', 'the sea', 'sea', 'vast water', 'open water', 'out at sea', 'deep ocean']),
    question: { prompt: 'You were at or in the ocean. What question that is larger than your ordinary daily concerns has recently surfaced for you — something existential, something about direction or meaning?', subtext: 'The ocean in dreams encodes something beyond personal history.' }},

  { detect: d => matchesText(d.rawText, ['river', 'stream', 'current', 'flowing water', 'going downstream', 'going upstream', 'across the river']),
    question: { prompt: 'There was a river. Were you flowing with it or fighting the current? What in your life right now are you resisting that may be moving in a direction you need to accept?', subtext: 'The river is time and the forward movement of life.' }},

  { detect: d => matchesText(d.rawText, ['water', 'swimming', 'lake', 'pool', 'pond', 'rain', 'flood', 'waves']),
    question: { prompt: 'What was the quality of the water — calm, murky, turbulent, or rising? Name the emotion that matches it exactly. Where does that emotion live in your life right now?', subtext: 'The water\'s condition is a direct map of your emotional state.' }},

  // ── Naked / exposed ─────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['no one noticed', 'nobody noticed', 'no one saw', 'nobody saw', 'didn\'t notice', 'didn\'t care', 'no one cared']),
    question: { prompt: 'Nobody noticed you were exposed. Your fear of being seen through is almost certainly larger than the reality of how you appear to others. What specifically are you convinced people can see through — that they probably cannot?', subtext: 'The nobody-notices variant is the impostor syndrome marker.' }},

  { detect: d => matchesText(d.rawText, ['everyone saw', 'people stared', 'they noticed', 'everyone noticed', 'staring at me', 'laughed at me', 'judged', 'horrified', 'shocked']),
    question: { prompt: 'People saw you and reacted. What specifically are you afraid of being found out for, or exposed as, right now? What truth about yourself feels most dangerous to have visible?', subtext: 'This variant maps to a genuine evaluative situation you are in.' }},

  { detect: d => matchesText(d.rawText, ['felt free', 'felt liberated', 'comfortable', 'didn\'t mind', 'okay with it', 'not embarrassed', 'felt good']),
    question: { prompt: 'You felt comfortable or liberated being naked. What mask or performance have you recently stopped maintaining? What authentic version of yourself has become safe enough to show?', subtext: 'Comfortable nakedness is a rare but significant freedom signal.' }},

  { detect: d => matchesText(d.rawText, ['naked', 'undressed', 'no clothes', 'nothing on', 'exposed', 'in my underwear', 'topless', 'embarrassed', 'shame']),
    question: { prompt: 'Where in your life are you currently more exposed or visible than feels comfortable — and is that fear proportionate to how you actually appear to others?', subtext: 'Nakedness dreams map to visibility anxiety, not literal exposure.' }},

  // ── Work ────────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['fired', 'got fired', 'was fired', 'sacked', 'let go', 'laid off', 'dismissed']),
    question: { prompt: 'You were fired in the dream. Where do you currently fear being deemed inadequate or removed from something that matters to you — not necessarily your job?', subtext: 'Being fired in dreams is about belonging and worth, rarely about literal job security.' }},

  { detect: d => matchesText(d.rawText, ['my boss', 'the boss', 'manager', 'supervisor', 'my manager']),
    question: { prompt: 'Your boss appeared. What internalized standard or authority are you currently measuring yourself against — and whose judgment feels most powerful over your sense of adequacy right now?', subtext: 'The boss encodes the internalized evaluator, not necessarily the real person.' }},

  { detect: d => matchesText(d.rawText, ['couldn\'t find the office', 'wrong office', 'wrong floor', 'wrong building', 'couldn\'t find work', 'lost at work']),
    question: { prompt: 'You couldn\'t find the office or were in the wrong place at work. Does your current role feel genuinely yours — are you in the right room professionally?', subtext: 'Getting lost at work encodes role identity uncertainty.' }},

  { detect: d => matchesPeople(d.people, ['boss', 'colleague', 'coworker', 'manager']) || matchesText(d.rawText, ['at work', 'the office', 'my boss', 'my colleague', 'work meeting', 'workplace']),
    question: { prompt: 'What specific work situation is still occupying mental bandwidth after hours — what is unresolved, unspoken, or unfinished there?', subtext: 'Work dreams track what your brain has not finished processing.' }},

  // ── Family ──────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['my mother', 'my mom', 'my mum', 'mother appeared', 'mom appeared']) || matchesPeople(d.people, ['mother', 'mom', 'mum']),
    question: { prompt: 'Your mother appeared. Where in your current life do you feel either deeply nurtured and sustained, or harshly self-critical and never quite enough? Who or what is activating that same dynamic?', subtext: 'The mother figure encodes sustenance, belonging, and the inner critic.' }},

  { detect: d => matchesText(d.rawText, ['my father', 'my dad', 'father appeared', 'dad appeared']) || matchesPeople(d.people, ['father', 'dad']),
    question: { prompt: 'Your father appeared. Where are you currently being evaluated, or measuring yourself against a standard? What does meeting that standard mean to you — and is that standard actually yours?', subtext: 'The father figure encodes authority, performance, and self-judgment.' }},

  { detect: d => matchesText(d.rawText, ['my sister', 'my brother', 'sibling', 'sister appeared', 'brother appeared']) || matchesPeople(d.people, ['sister', 'brother', 'sibling']),
    question: { prompt: 'A sibling appeared. What quality in yourself are you currently comparing, competing with, or seeing reflected back at you? What part of yourself does this sibling most represent?', subtext: 'A sibling is often a near-mirror of the self.' }},

  { detect: d => matchesPeople(d.people, ['mother', 'father', 'mom', 'dad', 'sister', 'brother', 'parent', 'grandma', 'grandpa', 'family']) || matchesText(d.rawText, ['my family', 'my parents', 'family member']),
    question: { prompt: 'Which family member appeared — and what one role or quality do they most embody for you? Who in your current life is activating that same dynamic?', subtext: 'The family member is a psychological role, not just a person.' }},

  // ── Teeth ───────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['teeth fell', 'teeth falling', 'teeth fell out', 'lost my teeth', 'teeth crumbling', 'teeth breaking', 'teeth rotting']),
    question: { prompt: 'Do you wake with jaw tension, headaches, or tightness around your face? Your teeth dream has a strong physical component. Beyond that: where are you clenching or holding tension that you haven\'t released?', subtext: 'Teeth dreams are among the most physiologically grounded. Check jaw first.' }},

  // ── Being lost ──────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['lost in a forest', 'lost in the woods', 'lost in nature', 'forest', 'woods', 'jungle']),
    question: { prompt: 'You were lost in nature or a forest. What genuinely unknown territory are you entering right now — not a crisis, but something unfamiliar that you haven\'t yet mapped?', subtext: 'Being lost in nature is exploratory, not crisis-driven.' }},

  { detect: d => matchesText(d.rawText, ['lost in a building', 'lost in an office', 'lost inside', 'couldn\'t find the exit', 'maze', 'labyrinth', 'corridors']),
    question: { prompt: 'You were lost inside a building or maze. What specific system — an organization, a relationship, a belief structure — has become so complex that you can\'t find your way through it?', subtext: 'Indoor lost dreams encode structural complexity, not directional confusion.' }},

  { detect: d => matchesText(d.rawText, ['curious', 'exploring', 'interesting', 'discovered', 'wasn\'t scared', 'not scared']) && matchesText(d.rawText, ['lost', 'unknown', 'unfamiliar']),
    question: { prompt: 'You were lost but not distressed — curious rather than panicked. What transition or unknown territory are you entering willingly right now? What makes it interesting rather than frightening?', subtext: 'Lost-but-curious is a chosen transition signal.' }},

  { detect: d => matchesText(d.rawText, ['lost', 'getting lost', 'couldn\'t find', 'unfamiliar place', 'wrong direction', 'no idea where']),
    question: { prompt: 'Where in your life are you navigating right now without a clear map — what situation has no obvious path forward and no reliable guide?', subtext: 'Being lost mirrors real-life uncertainty or transition.' }},

  // ── Car / driving ───────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['brakes failed', 'brakes didn\'t work', 'couldn\'t brake', 'brakes', 'couldn\'t slow down', 'couldn\'t stop']),
    question: { prompt: 'The brakes failed. What are you unable to slow down or stop right now — what are you overcommitted to that you cannot decelerate from even though you want to?', subtext: 'Brake failure is one of the most direct continuity signals in dream research.' }},

  { detect: d => matchesText(d.rawText, ['lost control', 'swerving', 'steering failed', 'couldn\'t steer', 'car went off', 'out of control']),
    question: { prompt: 'You lost control of the vehicle. What situation in your life is moving in a direction you can\'t steer — what feels like it has its own momentum regardless of what you do?', subtext: 'Loss of steering encodes situations with their own uncontrollable direction.' }},

  { detect: d => matchesText(d.rawText, ['crashed', 'car crash', 'accident', 'collision', 'hit something']),
    question: { prompt: 'There was a crash. What has recently come to an abrupt collision point — what two directions, people, or commitments have finally met head-on?', subtext: 'A crash encodes a convergence or abrupt end, not just danger.' }},

  { detect: d => matchesText(d.rawText, ['car', 'driving', 'drove', 'vehicle', 'road', 'highway']),
    question: { prompt: 'Who was driving — you or someone else? And where does your life feel like it\'s heading right now: in a direction you chose, or one you\'re being carried along in?', subtext: 'The driver is the agent of direction. Who holds the wheel matters.' }},

  // ── Fire ────────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['house on fire', 'home on fire', 'my house was burning', 'building on fire', 'everything was burning']),
    question: { prompt: 'Your house was on fire. What foundational structure of your life — a relationship, a role, a belief you built yourself on — feels like it is being destroyed or consumed from within?', subtext: 'The house on fire is the most intense version of the fire symbol.' }},

  { detect: d => matchesText(d.rawText, ['i was burning', 'i was on fire', 'burned me', 'burning me', 'i caught fire']),
    question: { prompt: 'You were burning. What is consuming you from the inside right now — what emotional experience or pressure feels literally scorching, relentless, or impossible to escape?', subtext: 'Being burned maps to a consuming internal state, not external events.' }},

  { detect: d => matchesText(d.rawText, ['fire', 'burning', 'flames', 'on fire']),
    question: { prompt: 'What emotion or situation in your life right now has the quality of fire — consuming, spreading, bright, or impossible to control? What is burning most intensely?', subtext: 'Fire tracks emotional intensity. The question is what it is fueled by.' }},

  // ── Attack ──────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['stabbed', 'stab', 'knife', 'stabbed me', 'was stabbed']),
    question: { prompt: 'You were stabbed. What has recently gotten through your defenses — what unexpected blow, betrayal, or painful truth penetrated when you weren\'t protected?', subtext: 'Being stabbed encodes a breach: something got through.' }},

  { detect: d => matchesText(d.rawText, ['couldn\'t fight back', 'couldn\'t defend', 'helpless', 'powerless', 'couldn\'t stop them', 'unable to fight']),
    question: { prompt: 'You couldn\'t fight back or defend yourself. Where in your waking life do you feel genuinely powerless to change an outcome — where does defending yourself feel impossible?', subtext: 'Inability to fight back encodes specific felt helplessness.' }},

  { detect: d => matchesText(d.rawText, ['fought back', 'defended myself', 'i fought', 'hit back', 'pushed back', 'fought them off']),
    question: { prompt: 'You fought back. Where in your waking life are you asserting yourself after a period of accommodation or silence — what boundary are you finally enforcing?', subtext: 'Fighting back in dreams tracks real-life self-assertion.' }},

  { detect: d => matchesText(d.rawText, ['attacked', 'attack', 'fighting', 'threatened', 'assaulted', 'beaten', 'hit me', 'came after me']),
    question: { prompt: 'What or who was the source of the threat — and what quality does that source represent? What in your waking life carries that same threatening quality right now?', subtext: 'The attacker\'s identity is the message, not the violence.' }},

  // ── Pregnancy / birth ───────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['miscarriage', 'lost the baby', 'pregnancy loss', 'lost the pregnancy']),
    question: { prompt: 'There was a pregnancy loss in the dream. What project, potential, or part of yourself that you have been cultivating feels genuinely at risk of not surviving its current transition?', subtext: 'Miscarriage dreams almost always process fear of loss, not grief itself.' }},

  { detect: d => matchesText(d.rawText, ['giving birth', 'gave birth', 'in labor', 'in labour', 'contractions', 'the birth']),
    question: { prompt: 'You were giving birth. What is ready to emerge from private development into public existence — what have you been building internally that is ready to become visible?', subtext: 'Birth is the transition from internal to external. What are you about to launch?' }},

  { detect: d => matchesText(d.rawText, ['unexpected pregnancy', 'didn\'t know i was pregnant', 'suddenly pregnant', 'surprise pregnancy', 'found out i was pregnant']),
    question: { prompt: 'The pregnancy was unexpected. What has arrived in your life that you did not plan for and now have to decide how to relate to — an opportunity, a responsibility, or a development you didn\'t initiate?', subtext: 'Unexpected pregnancy encodes something that chose you, not something you chose.' }},

  { detect: d => matchesText(d.rawText, ['pregnant', 'pregnancy', 'baby', 'birth', 'giving birth', 'expecting', 'newborn', 'infant']),
    question: { prompt: 'What are you currently gestating or nurturing that has not yet been made visible to others — and what is your relationship to the moment it becomes real and seen?', subtext: 'Birth imagery tracks things in development, not always literal ones.' }},

  // ── Wild animals ────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['befriended', 'tamed', 'gentle', 'peaceful animal', 'friendly animal', 'animal trusted me', 'animal came to me']),
    question: { prompt: 'The animal was gentle or came to you. What instinctual quality — drive, energy, or force — are you currently integrating or allowing yourself to own that you previously kept at a distance?', subtext: 'A tamed or befriended animal signals successful integration of a drive.' }},

  { detect: d => matchesText(d.rawText, ['wounded animal', 'injured animal', 'caged animal', 'trapped animal', 'hurt animal']),
    question: { prompt: 'The animal was wounded or caged. What natural drive, energy, or vitality in yourself has been suppressed or cut off from expression — what are you not allowing yourself?', subtext: 'A wounded animal encodes suppressed life force.' }},

  { detect: d => matchesText(d.rawText, ['bear', 'wolf', 'tiger', 'lion', 'shark', 'crocodile', 'panther', 'eagle', 'wild animal', 'predator', 'beast']),
    question: { prompt: 'What was the animal doing — threatening, wounded, or calm? And what one quality does that animal embody that you might be suppressing or not yet claiming in yourself?', subtext: 'The animal\'s behaviour matters more than its species.' }},

  // ── Trapped ─────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['trapped', 'locked in', 'couldn\'t get out', 'no way out', 'stuck', 'imprisoned', 'no exit', 'bars', 'cage', 'confined']),
    question: { prompt: 'What in your life — a relationship, a role, a belief, a financial situation — feels like it has no exit right now? What would it mean to find a door?', subtext: 'Confinement dreams are among the most direct continuity signals.' }},

  // ── Cheating ────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['i cheated', 'i was unfaithful', 'i had an affair', 'i was cheating']),
    question: { prompt: 'You were the one who cheated. Where in your life are you currently divided between two commitments, loyalties, or desires — and which one are you giving less of yourself to than you should?', subtext: 'Dreaming of cheating usually encodes divided loyalty, not literal desire.' }},

  { detect: d => matchesText(d.rawText, ['cheated on me', 'cheating on me', 'caught them cheating', 'they were cheating', 'partner cheated', 'was unfaithful to me']),
    question: { prompt: 'Your partner was unfaithful in the dream. Where do you currently feel emotionally neglected, like a lower priority than something else in their life — or in your relationship?', subtext: 'Partner infidelity dreams rarely signal literal suspicion. They signal felt emotional neglect.' }},

  { detect: d => matchesText(d.rawText, ['cheating', 'betrayal', 'affair', 'infidelity', 'betrayed']),
    question: { prompt: 'Where in your life are you feeling emotionally unseen, undervalued, or like something important to you is being given to something or someone else?', subtext: 'Betrayal dreams track relational emotional gaps, not literal events.' }},

  // ── Exam / performance ──────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['blank paper', 'blank mind', 'couldn\'t remember anything', 'mind went blank', 'forgot everything', 'couldn\'t write']),
    question: { prompt: 'Your mind went blank at the crucial moment. Where in your life do you feel that your preparation and capability disappear under pressure — that you know more than you can access when it counts?', subtext: 'Blank-mind is the impostor syndrome variant. You know more than you think.' }},

  { detect: d => matchesText(d.rawText, ['wrong exam', 'wrong subject', 'wrong class', 'wrong room', 'wrong test', 'wasn\'t my subject']),
    question: { prompt: 'You were being tested on something that wasn\'t yours or in the wrong room. Does your current path or role feel genuinely like yours — or are you being evaluated by someone else\'s criteria for someone else\'s goals?', subtext: 'Wrong-subject dreams encode identity mismatch, not performance anxiety.' }},

  { detect: d => matchesText(d.rawText, ['exam', 'test', 'unprepared', 'not ready', 'presentation', 'interview', 'performance review', 'being evaluated', 'being judged']),
    question: { prompt: 'Who is evaluating you in this dream — and what does their judgment mean to you? That person, or what they represent, is whose approval you are currently seeking.', subtext: 'The evaluator is more informative than what you are being tested on.' }},

  // ── Recurring ───────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['again', 'same dream', 'recurring', 'i\'ve had this', 'had this dream before', 'this dream again']),
    question: { prompt: 'This dream has returned. Recurring dreams stop when the underlying issue resolves. What situation or feeling in your waking life has remained unaddressed the entire time this dream has been visiting you?', subtext: 'The dream will keep returning until the waking-life source is acknowledged.' }},

  // ── Invisibility ────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['invisible', 'no one could see me', 'no one noticed', 'as if i wasn\'t there', 'couldn\'t see me', 'passed through']),
    question: { prompt: 'Where in your life do you currently feel most unseen — where are your efforts, your presence, or your needs not being registered by the people who matter?', subtext: 'Invisibility tracks the feeling of being overlooked, not the wish to hide.' }},

  // ── Relationship conflict / breakup ─────────────────────────────────────────
  { detect: d =>
      matchesText(d.rawText, ['broke up', 'break up', 'breaking up', 'we broke up', 'he broke up with me', 'she broke up with me', 'ended the relationship', 'split up', 'left me', 'he left me', 'she left me', 'leaving me']) ||
      (matchesText(d.rawText, ['boyfriend', 'girlfriend', 'husband', 'wife', 'my partner', 'my fiance']) &&
       matchesText(d.rawText, ['fight', 'fighting', 'fought', 'argue', 'arguing', 'argument', 'yelling', 'screaming', 'broke up', 'breaking up', 'split', 'conflict'])),
    question: { prompt: 'What is the unspoken tension in this relationship right now? Not what you argued about in the dream, but what you have not yet said out loud in waking life?', subtext: 'The dream fight is almost never about the dream subject. It is the brain finding a container for something real that has not been named.' }},

  // ── Wedding / commitment ─────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['wedding', 'getting married', 'marriage', 'my wedding', 'bride', 'groom', 'vows', 'altar', 'engaged', 'proposal', 'proposing']),
    question: { prompt: 'What are you committing to, or avoiding committing to, in your waking life right now? What decision, direction, or irreversible step is on your horizon that you have not yet fully said yes or no to?', subtext: 'The wedding is rarely about the relationship. It is about the act of committing itself.' }},

  // ── Ex-partner ──────────────────────────────────────────────────────────────
  { detect: d => matchesPeople(d.people, ['ex', 'ex-', 'former', 'ex-boyfriend', 'ex-girlfriend']) || matchesText(d.rawText, ['my ex', 'ex ', 'ex-', 'former partner', 'old partner', 'used to date']),
    question: { prompt: 'This person represents a relationship pattern, not themselves. What dynamic from that relationship, the emotional role they played, the way they made you feel, is currently active in your life with a different person or situation?', subtext: 'Ex-partner dreams almost never signal unresolved feelings for that person.' }},

  // ── Deceased person ─────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['died', 'passed away', 'deceased', 'dead person', 'who died', 'my late', 'no longer alive', 'gone']) && !matchesText(d.rawText, ['i died', 'i was dying', 'i got killed']),
    question: { prompt: 'What would you want to say to this person that was never said — and what feels unfinished between you?', subtext: 'These dreams often surface around significant dates, transitions, or when something activates their memory.' }},

  // ── Emotion-based fallbacks ─────────────────────────────────────────────────
  { detect: d => d.emotions.includes('anxious') || d.emotions.includes('fearful'),
    question: { prompt: 'What specific situation is generating the most anxiety for you this week — not the category of worry, but the precise thing?', subtext: 'Naming it precisely reduces its charge.' }},

  { detect: d => d.emotions.includes('sad') || d.emotions.includes('angry'),
    question: { prompt: 'What loss, disappointment, or frustration is still present for you right now — what hasn\'t been expressed or released?', subtext: 'Engaging with this reduces its emotional weight.' }},

  { detect: d => d.emotions.includes('curious') || d.emotions.includes('excited'),
    question: { prompt: 'What new direction or possibility is currently energizing you — what are you drawn toward that you haven\'t fully committed to yet?', subtext: 'Positive dream affect tracks real opportunity.' }},

  { detect: d => d.emotions.includes('happy'),
    question: { prompt: 'What in your life right now is generating genuine satisfaction — what is going well that you might be underweighting or not giving yourself credit for?', subtext: 'Positive emotion in dreams is worth mapping consciously.' }},

  // ── Toilet / bathroom ───────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['toilet', 'bathroom', 'couldn\'t find a toilet', 'public toilet', 'dirty toilet', 'overflowing toilet', 'toilet was exposed']),
    question: { prompt: 'What do you need to release right now that you have not yet found the right context or permission to let go of? What is being retained past its natural release point?', subtext: 'The toilet is the private release mechanism. The dream is about what cannot yet come out.' }},

  // ── Feces ────────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['poop', 'feces', 'excrement', 'defecating', 'stepped in poop', 'covered in feces']),
    question: { prompt: 'What have you finished with and need to release? What have you been processing for long enough that it is now time to let it go rather than continue carrying it?', subtext: 'Feces in dreams encode completed processing and the need for elimination.' }},

  // ── Crying ───────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['couldn\'t stop crying', 'burst into tears', 'sobbing', 'crying uncontrollably', 'wept', 'weeping']),
    question: { prompt: 'What have you been holding back that needed to come out? What grief, relief, or accumulated weight has not yet found a place to be fully felt?', subtext: 'Uncontrollable crying in dreams processes emotional weight that was suppressed while awake.' }},

  { detect: d => matchesText(d.rawText, ['crying', 'i cried', 'i was crying', 'tears', 'cried in my dream']),
    question: { prompt: 'What were you crying about in the dream, or what do you think the tears were for? Where in your waking life does that same emotional weight live right now?', subtext: 'Crying in dreams completes emotional processing that did not finish while awake.' }},

  // ── Theft / robbery ──────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['stolen', 'robbed', 'robbery', 'thief', 'burglar', 'i was robbed', 'they took']),
    question: { prompt: 'What specifically was taken in the dream, and what does that object represent to you? In your waking life, what feels like it is being appropriated from you without your consent?', subtext: 'What was stolen is the message. The theft encodes a real violation of something that is yours.' }},

  { detect: d => matchesText(d.rawText, ['i stole', 'i took something', 'shoplifting']),
    question: { prompt: 'What are you acquiring or claiming that does not yet fully feel like yours to have? Where is the gap between what you want and what you feel entitled to?', subtext: 'Being the thief often encodes impostor syndrome or desire for something out of current reach.' }},

  // ── Police ───────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['arrested', 'being arrested', 'handcuffed', 'detained', 'interrogated']),
    question: { prompt: 'What rule or standard of your own are you currently violating, or afraid of being caught violating? Not an external law, but a judgment you hold about yourself and what you are or are not allowed to want.', subtext: 'Being arrested in dreams is almost never about actual law. It is about the inner judge.' }},

  { detect: d => matchesText(d.rawText, ['police', 'cop', 'cops', 'officer', 'being chased by police', 'chased by cops']),
    question: { prompt: 'What is your own inner authority currently pursuing you for? What are you doing, wanting, or avoiding that your internalized rules say you should not be?', subtext: 'Police represent the superego: your own standards enforcing themselves.' }},

  // ── Snow / ice ───────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['blizzard', 'buried in snow', 'snowstorm', 'avalanche']),
    question: { prompt: 'What has been accumulating in your life until movement has become impossible — what is the snow that has buried the path forward?', subtext: 'Being buried or blinded by snow encodes accumulation past the point of navigation.' }},

  { detect: d => matchesText(d.rawText, ['ice', 'icy', 'walking on ice', 'ice cracked', 'frozen']),
    question: { prompt: 'What emotion or situation in your life has frozen rather than flowed — what has stopped moving that needs to thaw? Or: where are you navigating something that could break without warning?', subtext: 'Ice is frozen water. Water is emotion. Ice is emotion stopped.' }},

  { detect: d => matchesText(d.rawText, ['snow', 'snowing', 'winter', 'frost']),
    question: { prompt: 'Does the snow feel like stillness and rest, or like isolation and blockage? What in your life right now has that same quality of being suspended, paused, or covered over?', subtext: 'Snow\'s emotional tone determines whether it is purification or entombment.' }},

  // ── Clothing ─────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['wrong clothes', 'clothes didn\'t fit', 'clothes were wrong', 'dressed wrong', 'dressed inappropriately']),
    question: { prompt: 'Where in your life does the role or identity you are currently presenting feel like a mismatch with who you actually are underneath it? Which relationship or context requires a persona that does not fit?', subtext: 'Wrong clothes encode persona-self mismatch: the outfit and the person do not correspond.' }},

  { detect: d => matchesText(d.rawText, ['clothes', 'clothing', 'outfit', 'getting dressed', 'what i was wearing']),
    question: { prompt: 'What role or persona are you currently wearing — and how close is it to the self underneath? Where do you feel most and least authentic in how you present yourself?', subtext: 'Clothing is the persona. The dream question is always: does it fit?' }},

  // ── Shoes ────────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['no shoes', 'barefoot', 'shoes didn\'t fit', 'lost my shoes', 'wrong shoes', 'broken shoes']),
    question: { prompt: 'What foundation beneath you feels unstable, missing, or mismatched to the terrain you are currently navigating? Are you equipped for the ground you are actually walking on?', subtext: 'Shoes are the interface between self and ground. Their condition is your readiness.' }},

  // ── Door ─────────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['locked door', 'door won\'t open', 'couldn\'t open the door', 'door was locked']),
    question: { prompt: 'What access is currently denied to you that you feel should be available? What door in your life is locked, and what would give you the key?', subtext: 'A locked door is the threshold you need but cannot yet cross.' }},

  { detect: d => matchesText(d.rawText, ['many doors', 'corridor of doors', 'multiple doors']),
    question: { prompt: 'You have too many doors. What specific choice or direction are you avoiding by keeping all options open? Which door do you most want to walk through if you are honest?', subtext: 'Many doors encode the paralysis of too many available paths.' }},

  { detect: d => matchesText(d.rawText, ['a door', 'the door', 'open door', 'closed door', 'doorway', 'knocked on the door']),
    question: { prompt: 'What threshold are you currently standing at — what is on the other side of a door in your life that you have not yet walked through? Is the resistance to crossing it external or internal?', subtext: 'The door separates where you are from where you could be.' }},

  // ── Luggage / suitcase ───────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['can\'t pack', 'can\'t close the suitcase', 'overpacked', 'too much luggage', 'heavy luggage']),
    question: { prompt: 'What are you trying to bring into your next phase of life that will not fit — what from the past do you need to leave behind but are still trying to pack?', subtext: 'What cannot be packed is what must be released.' }},

  { detect: d => matchesText(d.rawText, ['suitcase', 'luggage', 'packing', 'packed', 'lost luggage', 'carry-on']),
    question: { prompt: 'What are you carrying from your past into your next phase — and is it the right cargo? What would you leave behind if you could pack only what you actually need?', subtext: 'Luggage is the psychological cargo of history. Transitions require selective packing.' }},

  // ── Cave ─────────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['cave', 'cavern', 'underground', 'in a tunnel', 'dark tunnel', 'inside a cave']),
    question: { prompt: 'What are you descending into — willingly or reluctantly? What ancient, instinctual, or deeply buried part of yourself is this dream inviting you to encounter rather than avoid?', subtext: 'The cave is the descent into the deepest self. What lives there is waiting to be met.' }},

  // ── Bath / shower ────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['couldn\'t get clean', 'still dirty after washing', 'washed it off']),
    question: { prompt: 'What do you feel contaminated by that ordinary cleansing will not reach? What guilt, shame, or residue of an experience has gotten beneath the surface in a way that cannot be washed off from the outside?', subtext: 'Inability to get clean encodes a contamination that is internal, not external.' }},

  { detect: d => matchesText(d.rawText, ['taking a bath', 'taking a shower', 'having a shower', 'having a bath', 'washing myself', 'bathtub', 'cleansing']),
    question: { prompt: 'What are you trying to wash off or wash away right now? What residue of a recent experience, emotion, or situation are you ready to be clean of?', subtext: 'Bathing in dreams is purification: something needs to be left behind.' }},

  // ── Vampire ──────────────────────────────────────────────────────────────────
  { detect: d => matchesText(d.rawText, ['vampire', 'vampires', 'vampire bite', 'sucking my blood', 'draining my blood', 'becoming a vampire']),
    question: { prompt: 'What or who in your life is extracting your energy, time, or vitality without reciprocating? What are you giving to that leaves you depleted rather than nourished — and why is it hard to stop?', subtext: 'The vampire is the drain. It takes life force specifically. What is doing that?' }},

  // ── Default ─────────────────────────────────────────────────────────────────
  { detect: () => true,
    question: { prompt: 'Where in your waking life do you recognize the emotional tone of this dream — not the content, but the feeling it left you with?', subtext: 'Dreams mirror what is most active in your inner life.' }},
]

export function getIPAQuestion(draft: MorningEntryDraft): IPAQuestion {
  for (const rule of IPA_RULES) {
    if (rule.detect(draft)) return rule.question
  }
  return IPA_RULES[IPA_RULES.length - 1].question
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getInsightForEntry(draft: MorningEntryDraft): Insight {
  for (const rule of RULES) {
    if (rule.detect(draft)) return rule.insight
  }
  return RULES[RULES.length - 1].insight
}

// Returns up to `max` distinct content matches — skips generic emotion/default fallbacks
// so secondary insights are always substantive, not "you felt anxious" boilerplate
const FALLBACK_TAGS = new Set([
  'Emotional memory consolidation',
  'Emotional memory trade-off',
  'Default mode network',
  'Positive affect consolidation',
  'Continuity hypothesis',
])

export function getInsightsForEntry(draft: MorningEntryDraft, max = 3): Insight[] {
  const results: Insight[] = []
  for (const rule of RULES) {
    if (FALLBACK_TAGS.has(rule.insight.tag)) continue
    if (rule.detect(draft)) {
      results.push(rule.insight)
      if (results.length >= max) break
    }
  }
  // If nothing content-specific fired, fall back to the single standard result
  if (results.length === 0) return [getInsightForEntry(draft)]
  return results
}

// Legacy: used in PatternsScreen
export function getContinuityFact() {
  return {
    text: 'The more time you spend on something while awake, the more likely it appears in your dreams. This continuity between waking life and dream content is one of the most replicated findings in sleep research.',
    citation: 'Schredl (2003, 2024), Continuity Hypothesis',
  }
}
