# ARplusCSS — Use Case Diagram

Who uses the system and what they can do. Plain language; render in any Mermaid
viewer (GitHub, VS Code, mermaid.live).

```mermaid
flowchart LR
  Learner(("Learner"))
  Device(("Device camera<br/>& ARCore"))

  subgraph SYS["ARplusCSS (the system)"]
    direction TB

    subgraph GET["Getting started"]
      UC_lesson(["Choose a lesson"])
      UC_cap(["Take a photo of the hardware"])
      UC_verify(["Check the photo really<br/>shows a motherboard"])
      UC_help(["Read Help & Guide"])
    end

    subgraph COMMON["Shared AR behaviour"]
      UC_track(["Point camera until<br/>the hardware is found"])
      UC_align(["Line up the motherboard"])
      UC_guide(["Read a step-by-step guide"])
      UC_video(["Watch a how-to video"])
      UC_reset(["Reset or exit the lesson"])
    end

    subgraph PC["Build a PC lesson"]
      UC_tap(["Tap a PC part"])
      UC_place(["Place the part on<br/>the correct spot"])
      UC_done_pc(["Place every part"])
    end

    subgraph NET["Network cable lesson"]
      UC_type(["Pick cable type<br/>(straight / crossover)"])
      UC_step(["Work through the<br/>6 cabling steps"])
      UC_wires(["Practice the wire colours"])
      UC_done_net(["Finish both cable ends"])
    end

    UC_congrats(["See 'Congratulations!'"])
  end

  %% Who can do what
  Learner --> UC_lesson
  Learner --> UC_cap
  Learner --> UC_help
  Learner --> UC_track
  Learner --> UC_reset
  Learner --> UC_tap
  Learner --> UC_place
  Learner --> UC_type
  Learner --> UC_step
  Learner --> UC_wires

  %% Supporting system actor
  UC_track -. "uses" .-> Device

  %% Included / optional behaviour
  UC_cap -. "includes" .-> UC_verify
  UC_tap -. "includes" .-> UC_guide
  UC_place -. "includes" .-> UC_guide
  UC_step -. "includes" .-> UC_guide
  UC_step -. "optionally" .-> UC_video

  %% Outcomes
  UC_tap --> UC_place
  UC_place --> UC_done_pc
  UC_wires --> UC_done_net
  UC_done_pc --> UC_congrats
  UC_done_net --> UC_congrats
  UC_track --> UC_align
```

**Actors**

- **Learner** — the student using the app (the only person who interacts with it).
- **Device camera / ARCore** — a supporting actor the system relies on to recognise
  the real hardware. It is not a person.

**Legend**

- Solid arrow from an actor = "can do this".
- Dotted arrows = one use case **includes** another (always happens as part of it) or
  is **optional**.
- There is no login, no admin, and no other user role — everyone is a Learner.
