# Seydoux et al. (2022): KEA3-dependent regulation of non-photochemical quenching in diatoms

This model describes the regulation of non-photochemical quenching (NPQ) in the marine diatom *Phaeodactylum tricornutum*, based on the study by Seydoux et al. (2022). It investigates how the thylakoid H⁺/K⁺ antiporter KEA3 influences the proton-motive force, lumen acidification, and photoprotective responses under changing light conditions.

The model combines photosynthetic electron transport, proton dynamics, ATP synthesis, and the diadinoxanthin–diatoxanthin cycle to describe the regulation of NPQ. It consists of five ordinary differential equations representing reduced plastoquinone, lumenal protons, ATP synthase activity, ATP concentration, and diadinoxanthin concentration. Eight kinetic reactions describe the main photosynthetic and regulatory processes. Additionally, four quasi-steady-state photosystem II (PSII) states are calculated algebraically to determine the chlorophyll fluorescence signal.

The model investigates three different KEA3 conditions:

- Wild type (WT): Normal KEA3 activity.
- KEA3 mutant: Altered KEA3-dependent proton regulation, resulting in increased NPQ.
- KEA3 overexpressor: Enhanced KEA3 activity, resulting in reduced NPQ.

The model reproduces two key simulation results from the original study: NPQ induction and relaxation under changing illumination (Figure 3b), and the dependence of NPQ on light intensity (Figure 3c). These analyses illustrate how KEA3-dependent proton regulation influences photoprotection and light acclimation in diatoms.

The model has been reimplemented using MxlPy and converted into the native JSON format for GreenSloth to support interactive simulation, parameter exploration, and further analysis of photosynthetic regulatory mechanisms.

Reference:Seydoux, C. et al. (2022). *Impaired photoprotection in Phaeodactylum tricornutum KEA3 mutants reveals the proton regulatory circuit of diatoms light acclimation.* New Phytologist, 234, 578–591.

DOI: https://doi.org/10.1111/nph.18003
