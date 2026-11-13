## Overview

The chloroplast ATP synthase (CF₀CF₁) couples the efflux of protons from the lumen to ATP synthesis in the stroma. It is the main outlet of the proton motive force (pmf) built by linear and cyclic electron flow. Through the lumen pH it therefore also sets the strength of [NPQ](/mechanisms/npq) and the photosynthetic control of cytochrome b₆f. Its rate law determines how ATP and NADPH supply are balanced against each other, and how the lumen pH responds when the CBB cycle slows down. The choices below matter most in models that have an explicit proton balance.

## Driving force

The free energy available per proton is the pmf:

$$
\mathrm{pmf} = \Delta\psi + \frac{2.303\, RT}{F}\, \Delta\mathrm{pH} \approx \Delta\psi + 0.06\, \Delta\mathrm{pH} \quad (\mathrm{V})
$$

**ΔpH only.** The membrane potential is ignored. This is justified if Δψ is assumed to dissipate quickly through counter-ion fluxes, which holds in steady light after the first seconds ([Ebenhöh 2014](https://doi.org/10.1098/rstb.2013.0223), [Matuszyńska 2016](https://doi.org/10.1016/j.bbabio.2016.09.003), [Fuente 2024](https://doi.org/10.1016/j.plaphy.2024.109138)). It requires only one state variable, the lumen protons. _Pitfall:_ it overestimates how fast the lumen acidifies after a dark–light transition, and cannot reproduce ECS (P515) signals.

**pmf (ΔpH + Δψ).** Δψ becomes a state variable charged by electron transport and discharged by ATP synthase and ion channels (K⁺, Cl⁻). Whether the pmf is stored as Δψ or as ΔpH depends on these channels ([Zaks 2012](https://doi.org/10.1073/pnas.1211017109), [Davis 2017](https://doi.org/10.1098/rstb.2016.0381), [Li 2021](https://doi.org/10.1038/s41477-021-00947-5)). Choose this to simulate ECS, ion-channel mutants (_kea3_, _vccn1_), or fluctuating light.

**Not explicit.** ATP production is tied directly to electron transport through a fixed stoichiometry ([Bellasio 2019](https://doi.org/10.1007/s11120-018-0601-1)), or there is no ATP balance at all ([Johnson & Berry 2021](https://doi.org/10.1007/s11120-021-00840-4)).

## Rate law

**Mass action, pmf-dependent Keq.** A reversible first-order reaction in ADP whose equilibrium constant contains the proton gradient:

$$
v = k \left([\mathrm{ADP}] - \frac{[\mathrm{ATP}]}{K_{eq}}\right), \qquad
K_{eq} = [\mathrm{P_i}]\, \exp\!\left(\frac{-\Delta G^0_\mathrm{ATP} + n_{H^+}\, 2.303\, RT\, (\mathrm{pH_{stroma}} - \mathrm{pH_{lumen}})}{RT}\right)
$$

This is thermodynamically consistent: the flux reverses when the gradient cannot support the phosphorylation potential ([Ebenhöh 2014](https://doi.org/10.1098/rstb.2013.0223) and its descendants). The kinetics near equilibrium are linear, with no saturation in ADP or in the gradient.

**Mass action, (H⁺st/H⁺lu)ⁿ.** The same idea written with the proton concentration ratio raised to the H⁺/ATP stoichiometry ([Fuente 2024](https://doi.org/10.1016/j.plaphy.2024.109138)).

**Linear in pmf − ΔG/n.** The flux is proportional to the excess driving force, $v = V_{\max}(\mathrm{pmf} - \Delta G_\mathrm{ATP}/n)$, with a fixed phosphorylation potential ([Davis 2017](https://doi.org/10.1098/rstb.2016.0381)). This is a conductance view, convenient when ATP and ADP are not variables.

**Linear above threshold pmf.** $v = g\, [\mathrm{ATPase_{active}}]\, \max(0, \mathrm{pmf} - \mathrm{pmf_0})$ ([Zaks 2012](https://doi.org/10.1073/pnas.1211017109)). The threshold stands in for the phosphorylation potential.

**Sigmoidal in pmf.** An empirical saturating function of pmf ([Li 2021](https://doi.org/10.1038/s41477-021-00947-5)). It fits measured proton conductance ($g_{H^+}$) curves but is not thermodynamically constrained.

**Reversible Michaelis–Menten.** Saturating in ADP and Pi, with product inhibition by ATP and an equilibrium constant, while the maximal flux follows the supply from electron transport ([Bellasio 2019](https://doi.org/10.1007/s11120-018-0601-1)).

## Regulation

**None.** Activity is constant.

**Redox (Fd/Trx) activation.** The γ-subunit disulfide is reduced by thioredoxin in the light, which lowers the pmf threshold for activity. Without this, the enzyme would hydrolyse ATP in the dark. Modelled as a fraction of active enzyme driven by reduced ferredoxin ([Zaks 2012](https://doi.org/10.1073/pnas.1211017109)).

**Prescribed time course.** The active fraction follows an imposed function of time after light onset ([Li 2021](https://doi.org/10.1038/s41477-021-00947-5)). This is pragmatic, but it breaks under fluctuating light.

**Flux relaxes to supply.** The ATP production capacity relaxes towards the electron-transport-defined supply, with asymmetric time constants ([Bellasio 2019](https://doi.org/10.1007/s11120-018-0601-1)).

## Stoichiometry

The H⁺/ATP ratio equals the number of c-subunits in the rotor divided by three ATP per turn. Chloroplasts have a c₁₄ ring, so the ratio is 14/3 ≈ 4.67, and every model in GreenSloth that uses a ratio uses this value. Older models used 3 or 4. The ratio sets the ATP/NADPH ratio of linear electron flow (≈1.29 at 14/3), which falls short of the ≈1.5 the CBB cycle needs. That deficit is the main argument for cyclic electron flow, so changing the value changes the conclusions about CEF.

## Substrates and thermodynamics

**ADP (Pi fixed).** Pi enters $K_{eq}$ as a constant. This is fine while Pi does not limit, but TPU-limited conditions are defined by Pi depletion.

**ADP and Pi.** Both are variables, as needed when phosphate limitation of the light reactions matters ([Bellasio 2019](https://doi.org/10.1007/s11120-018-0601-1)).

**Fixed ΔG_ATP.** The phosphorylation potential is a parameter ([Davis 2017](https://doi.org/10.1098/rstb.2016.0381)).

**Irreversible, no substrates.** The flux depends on the pmf only ([Zaks 2012](https://doi.org/10.1073/pnas.1211017109), [Li 2021](https://doi.org/10.1038/s41477-021-00947-5)). ATP synthesis then cannot be limited by ADP supply from the CBB cycle.

## Equation catalogue

### Ebenhöh 2014, Matuszyńska 2016, Matuszyńska 2019, Saadat 2021, Pfennig 2024

$$
v = k_f \left([\mathrm{ADP}] - \frac{[\mathrm{ATP}]}{K_{eq}}\right), \qquad
K_{eq} = [\mathrm{P_i}]\, \exp\!\left(\frac{-\Delta G^0_\mathrm{ATP} + \mathrm{HPR}\cdot 2.303\, RT\, (\mathrm{pH} - \mathrm{pH_{lumen}})}{RT}\right)
$$

Matuszyńska 2019 and Saadat 2021 add a unit-conversion factor on ADP and ATP. Pfennig 2024 writes the pH difference in terms of cytoplasmic and lumenal proton amounts.

### Fuente 2024

$$
v = k_5 \left([\mathrm{ADP}] - \frac{[\mathrm{ATP}]}{c_{eq,P}}\left(\frac{[\mathrm{H^+_{stroma}}]}{[\mathrm{H^+_{lumen}}]}\right)^{14/3}\right)
$$

### Davis 2017

$$
v = V_{\max}\left(\mathrm{pmf} - \frac{\Delta G_\mathrm{ATP}}{n}\right), \qquad \mathrm{pmf} = \Delta\psi + 0.06\,(\mathrm{pH_{stroma}} - \mathrm{pH_{lumen}})
$$

### Zaks 2012

$$
v = \begin{cases} g_\mathrm{ATP}\, [\mathrm{ATPase_{active}}]\, (\mathrm{pmf} - \mathrm{pmf_0}) & \mathrm{pmf} > \mathrm{pmf_0} \\ 0 & \text{else} \end{cases}, \qquad
\frac{d\,[\mathrm{ATPase_{active}}]}{dt} = k_a\, [\mathrm{Fd_{red}}]\, [\mathrm{ATPase_{inactive}}] - k_i\, [\mathrm{ATPase_{active}}]
$$

### Li 2021

$$
v_{H^+} = \mathrm{HPR}\, V_{\max}\left[a(t)\left(1 - \frac{1}{1 + 10^{25\,\mathrm{pmf} - 3.3}}\right) + (1 - a(t))\left(1 - \frac{1}{1 + 10^{25\,\mathrm{pmf} - 5.1}}\right)\right]
$$

### Bellasio 2019

$$
v = \frac{J_\mathrm{ATP}\left([\mathrm{ADP}][\mathrm{P_i}] - [\mathrm{ATP}]/K_{eq}\right)}{K_\mathrm{ADP} K_\mathrm{P_i}\left(1 + \frac{[\mathrm{ADP}]}{K_\mathrm{ADP}} + \frac{[\mathrm{ATP}]}{K_\mathrm{ATP}} + \frac{[\mathrm{P_i}]}{K_\mathrm{P_i}} + \frac{[\mathrm{ADP}][\mathrm{P_i}]}{K_\mathrm{ADP} K_\mathrm{P_i}}\right)}
$$
