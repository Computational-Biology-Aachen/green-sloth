## Overview

When absorbed light exceeds what photochemistry can use, plants dissipate the excess as heat in the PSII antenna. In PAM measurements this is seen as a drop of maximal fluorescence, quantified as $\mathrm{NPQ} = F_m/F_m' - 1$. NPQ is not one process. The fast, pH-dependent component (qE) needs a low lumen pH and the protein PsbS. Zeaxanthin, made from violaxanthin by the pH-activated violaxanthin de-epoxidase, amplifies qE and keeps leaves quenched for minutes to hours (qZ). Photoinhibitory damage (qI) and state transitions (qT) also lower $F_m'$. Cyanobacteria use the orange carotenoid protein (OCP) instead. Models pick a subset of these and differ in how dynamically they describe them.

## Quencher representation

**Instantaneous f(pH).** The quencher is an algebraic Hill function of lumen pH, for example the protonated PsbS fraction

$$
\mathrm{PsbS^P} = \frac{1}{1 + 10^{\,n(\mathrm{pH_{lumen}} - \mathrm{p}K_a)}}
$$

multiplied by zeaxanthin ([Davis 2017](https://doi.org/10.1098/rstb.2016.0381), [Li 2021](https://doi.org/10.1038/s41477-021-00947-5)). It is cheap and has few parameters. _Pitfall:_ qE then follows the lumen pH without its own lag, so the induction and relaxation kinetics of NPQ come entirely from the pH dynamics and the xanthophyll cycle.

**One dynamic quencher.** A single quencher variable $Q$ relaxes towards a pH-dependent steady state, $\dot Q = k_+ (1 - Q) f(\mathrm{H^+}) - k_- Q$ ([Ebenhöh 2011](https://doi.org/10.1016/j.biosystems.2010.10.011), [Fuente 2024](https://doi.org/10.1016/j.plaphy.2024.109138)), or is activated by an excess-energy criterion ([Salvatori 2022](https://doi.org/10.3389/fpls.2021.787877)). This is the minimal form that has its own time constant.

**Dynamic PsbS protonation.** PsbS protonation is an explicit state that interacts with a xanthophyll pool ([Zaks 2012](https://doi.org/10.1073/pnas.1211017109)).

**PsbS × zeaxanthin states.** The quencher is a weighted sum over four combinations of protonated or deprotonated PsbS and zeaxanthin or violaxanthin ([Matuszyńska 2016](https://doi.org/10.1016/j.bbabio.2016.09.003)):

$$
Q = \gamma_0 (1-\zeta)(1-p) + \gamma_1 (1-\zeta)\, p + \gamma_2\, \zeta\, p + \gamma_3\, \zeta (1-p), \qquad \zeta = \frac{Z}{Z + K_{Z,\mathrm{sat}}}
$$

with $p$ the protonated PsbS fraction. This reproduces the memory effect: a second light period quenches faster because zeaxanthin is still present. [Matuszyńska 2019](https://doi.org/10.1111/ppl.12962), [Saadat 2021](https://doi.org/10.3389/fpls.2021.750580) and, in a leaf-level form, [Morales 2018](https://doi.org/10.1111/pce.13119) use it too.

**Explicit quenching sites.** Pigment–protein states (for example PsbS-bound violaxanthin, antheraxanthin or zeaxanthin) each contribute a quenching rate to the excited-state decay, and fluorescence follows from the lifetime $\tau = 1/\sum_i \kappa_i [Q_i]$ ([Holzwarth 2009](https://doi.org/10.1016/j.cplett.2009.10.085), [Lam 2026](https://doi.org/10.1038/s41467-026-70414-2)). Choose this when the data are fluorescence lifetimes rather than PAM yields.

**Inferred from PAM data.** The NPQ rate constant $k_N$ is not modelled but computed back from measured fluorescence ([Johnson & Berry 2021](https://doi.org/10.1007/s11120-021-00840-4)). This makes the model descriptive of NPQ, not predictive.

## Xanthophyll cycle

**V ⇄ Z.** One de-epoxidation step activated by lumen pH and a constitutive epoxidation:

$$
v_\mathrm{VDE} = k_\mathrm{VDE} [V] \frac{[\mathrm{H^+}]^n}{[\mathrm{H^+}]^n + K^n}, \qquad v_\mathrm{ZE} = k_\mathrm{ZE} [Z]
$$

**V ⇄ A ⇄ Z.** Antheraxanthin is resolved as an intermediate, which slows the build-up of zeaxanthin and lets antheraxanthin contribute partially to quenching ([Zaks 2012](https://doi.org/10.1073/pnas.1211017109), [Lam 2026](https://doi.org/10.1038/s41467-026-70414-2)).

**Relaxation to steady state.** The zeaxanthin fraction relaxes towards a steady state with separate induction and relaxation constants. This is phenomenological, but convenient in leaf-level models ([Morales 2018](https://doi.org/10.1111/pce.13119)).

_Pitfall:_ VDE requires ascorbate, and its pH optimum lies around 5.2. Models usually lump both into the Hill constants, which then do not transfer between species or conditions.

## Trigger

**Lumen pH.** The physiological trigger of qE and of VDE. It requires the model to have a lumen proton balance. See [ATP synthase](/mechanisms/atp-synthase#driving-force) for how proton efflux is described.

**PQ redox state.** Drives state transitions (STN7 kinase activated by reduced PQ, [Ebenhöh 2014](https://doi.org/10.1098/rstb.2013.0223)) and, in cyanobacteria, PSII quenching ([Pfennig 2024](https://doi.org/10.1371/journal.pcbi.1012445)).

**Light directly.** OCP is photoactivated by blue-green light ([Pfennig 2024](https://doi.org/10.1371/journal.pcbi.1012445)). In [Lam 2026](https://doi.org/10.1038/s41467-026-70414-2) the rate constants switch between light and dark values.

**Excess energy.** NPQ is activated when absorbed energy exceeds what electron transport can use. This is a supply–demand criterion with no lumen ([Salvatori 2022](https://doi.org/10.3389/fpls.2021.787877), [Morales 2018](https://doi.org/10.1111/pce.13119)). It is useful in leaf and crop models that have no proton balance.

## NPQ components

Fitting a single NPQ trace with several components is poorly identifiable. Decide which components the data can actually separate (dark-relaxation kinetics, mutants such as _npq4_ or _npq1_, lincomycin treatment).

- **qE**: fast (seconds to a minute), pH- and PsbS-dependent.
- **qZ**: zeaxanthin-dependent, relaxes over 10–30 min.
- **qI**: photoinhibition. Damaged PSII reaction centres are repaired over hours ([Morales 2018](https://doi.org/10.1111/pce.13119), [Lam 2026](https://doi.org/10.1038/s41467-026-70414-2)).
- **qT**: state transitions move LHCII between PSII and PSI. This is relevant mainly at low light and in algae ([Ebenhöh 2014](https://doi.org/10.1098/rstb.2013.0223), [Matuszyńska 2019](https://doi.org/10.1111/ppl.12962)).
- **OCP**: the cyanobacterial phycobilisome quencher ([Pfennig 2024](https://doi.org/10.1371/journal.pcbi.1012445)).

## Site of quenching

**Antenna.** Quenching adds a rate constant $k_N$ to the PSII antenna, or lowers the PSII cross-section. This is the usual choice and the one that the derivation of $F_m/F_m' - 1$ assumes.

**Two sites (Q1, Q2).** Detached, aggregated LHCII (Q1, PsbS-dependent) and antenna still attached to PSII (Q2, zeaxanthin-dependent) quench with different kinetics ([Holzwarth 2009](https://doi.org/10.1016/j.cplett.2009.10.085)).

**Phycobilisome.** In cyanobacteria, OCP binds the phycobilisome core and quenches its excitation before it reaches the photosystems ([Pfennig 2024](https://doi.org/10.1371/journal.pcbi.1012445)).

## Equation catalogue

### Davis 2017, Li 2021

$$
\mathrm{PsbS^P} = \frac{1}{1 + 10^{\,n(\mathrm{pH_{lumen}} - \mathrm{p}K_{\mathrm{PsbS}})}}
$$

$$
\text{Davis: } \mathrm{NPQ} = \mathrm{NPQ_{max}}\, \mathrm{PsbS^P}\, Z, \qquad
\text{Li: } \mathrm{NPQ} = \mathrm{NPQ_{max}}\left(0.5\, \mathrm{PsbS^P} + 0.1\, Z + 0.4\, \mathrm{PsbS^P} Z\right)
$$

with $n = 1$ (Davis) or $n = 3$ (Li), and $v_\mathrm{VDE} = V_\mathrm{VDE} [V] / (1 + 10^{\,n_\mathrm{VDE}(\mathrm{pH_{lumen}} - \mathrm{p}K_\mathrm{VDE})})$.

### Matuszyńska 2016, Matuszyńska 2019, Saadat 2021

$$
v_\mathrm{prot} = k_\mathrm{prot}\, [\mathrm{PsbS}] \frac{[\mathrm{H^+}]^{n}}{[\mathrm{H^+}]^{n} + K^{n}}, \qquad v_\mathrm{deprot} = k_\mathrm{deprot}\, [\mathrm{PsbS^P}]
$$

with the four-state quencher $Q$ as above and the same Hill form for VDE.

### Zaks 2012

$$
q = d_\mathrm{PsbS}\, [\mathrm{PsbS_Q}]\left(q_2\, z + q_3 (1 - z) + q_1\, z\, ([Z] + 0.5\,[A])\right)
$$

### Fuente 2024

$$
v_\mathrm{act} = \frac{k_3 (1 - Q)}{1 + (K_\mathrm{NPQ}/[\mathrm{H^+_{lumen}}])^{n}}, \qquad v_\mathrm{deact} = k_4 Q, \qquad \mathrm{NPQ} = \frac{\mathrm{NPQ_{max}}\, Q}{1 - \mathrm{NPQ_{max}}\, Q}
$$

### Morales 2018

$$
\Phi_{qE} = \Phi_{qE,\max}\left(\gamma_1 f_P + \gamma_3 f_Z + \gamma_2 f_P f_Z\right), \qquad
\frac{df_Z}{dt} = K_{i/d}\, (f_{qE,ss} - f_Z)
$$

### Ebenhöh 2014

$$
v_{1\to2} = \frac{k_\mathrm{Stt7}\, [\mathrm{LHC}]}{1 + \left(\frac{[\mathrm{PQ}]}{\mathrm{PQ_{tot}}\, K_M}\right)^{n}}, \qquad v_{2\to1} = k_\mathrm{Pph1}\, [\mathrm{LHC^P}]
$$

### Pfennig 2024

$$
\frac{d\,\mathrm{OCP}}{dt} = k_\mathrm{act}\, I_\mathrm{OCP} (\mathrm{OCP_{max}} - \mathrm{OCP}) - k_\mathrm{deact}\, \mathrm{OCP}, \qquad
v_\mathrm{quench} = k_Q\, [\mathrm{PSII}]\, [\mathrm{PQ_{red}}]
$$

### Lam 2026

$$
\tau_\mathrm{Fl} = \frac{1}{\kappa_{r,nr} + \kappa_{QA}[QA] + \kappa_{QL}[QL] + \kappa_{QV}[QV] + \kappa_{QZ}[QZ] + \kappa_{qI}[\mathrm{PSII_d}] + \kappa_{qZ}[Z]}
$$
