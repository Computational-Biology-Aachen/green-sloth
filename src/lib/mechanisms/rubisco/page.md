## Overview

Ribulose-1,5-bisphosphate carboxylase/oxygenase (Rubisco) fixes CO₂ onto RuBP, producing two molecules of 3-phosphoglycerate (PGA). It also accepts O₂, producing one PGA and one 2-phosphoglycolate, which enters photorespiration. Rubisco is slow (a turnover of a few per second per site), its active sites have to be activated by carbamylation and kept free of inhibitory sugar phosphates by Rubisco activase, and it sits at the junction of the light reactions (via RuBP regeneration) and CO₂ diffusion. No model represents all of this. The sections below go through the choices one by one.

## Resolution

**Lumped into a CBB flux.** Rubisco is not a separate reaction. A single carbon-fixation flux stands for the whole Calvin–Benson–Bassham cycle and is driven by its energy supply (NADPH, ATP) or by light. Choose this when the model is about the light reactions and the CBB cycle only needs to act as a sink for ATP and NADPH ([Li 2021](https://doi.org/10.1038/s41477-021-00947-5), [Salvatori 2022](https://doi.org/10.3389/fpls.2021.787877), [Pfennig 2024](https://doi.org/10.1371/journal.pcbi.1012445)). _Pitfall:_ the sink then has no CO₂ or RuBP feedback, so it cannot reproduce CO₂ responses or the post-illumination burst.

**Single rate law.** One irreversible reaction RuBP + CO₂ → 2 PGA with a saturating rate law. This is what nearly every metabolic and steady-state model does. It implicitly assumes that the enzyme–substrate complexes are in rapid equilibrium relative to the rest of the system.

**Elementary catalytic steps.** Enolisation of RuBP, gas addition (CO₂ or O₂), hydration and cleavage are resolved as separate steps with their own rate constants. Kinetic constants such as $K_c$ and $k_{cat}$ then emerge from microscopic rates. This is the language of enzyme-evolution and isotope-fractionation work ([Tcherkez 2006](https://doi.org/10.1073/pnas.0600605103)) and rarely appears in whole-system models. It is worth it only if the question is about Rubisco itself (specificity–rate trade-offs, ¹³C fractionation).

## RuBP dependence

**Saturated (Vcmax).** RuBP is assumed saturating, so the Rubisco-limited rate depends only on CO₂ and O₂:

$$
W_c = \frac{V_{c,\max}\, C}{C + K_c \left(1 + O/K_o\right)}
$$

RuBP limitation is then handled by a separate electron-transport-limited rate $W_j$ and a $\min()$. This is the FvCB approach. It holds only at steady state: RuBP pool dynamics are lost.

**Michaelis–Menten.** A two-substrate rate law in CO₂ and RuBP, often with competitive inhibitors on the RuBP site:

$$
v_c = \frac{V_{\max}\, [\mathrm{CO_2}]\, [\mathrm{RuBP}]}{\left([\mathrm{CO_2}] + K_{m,\mathrm{CO_2}}\right)\left([\mathrm{RuBP}] + K_{m,\mathrm{RuBP}}\left(1 + \sum_i [I_i]/K_{i}\right)\right)}
$$

This is the standard in Pettersson-type CBB models ([Poolman 2000](https://doi.org/10.1093/jexbot/51.suppl_1.319), [Matuszyńska 2019](https://doi.org/10.1111/ppl.12962)).

**Tight binding to sites.** In vivo the concentration of Rubisco active sites (~4 mM in the stroma) is similar to that of RuBP, so free RuBP is not equal to total RuBP. The fraction of sites occupied follows from the quadratic for a tight-binding enzyme ([Farquhar 1979](<https://doi.org/10.1016/0003-9861(79)90052-3>)):

$$
f_\mathrm{RuBP} = \frac{(E_t + R + K) - \sqrt{(E_t + R + K)^2 - 4\, E_t\, R}}{2\, E_t}
$$

with $E_t$ the active-site concentration, $R$ the total RuBP and $K$ the (apparent) $K_m$. Used by [Morales 2018](https://doi.org/10.1111/pce.13119) and [Bellasio 2019](https://doi.org/10.1007/s11120-018-0601-1). Choose this whenever RuBP is a dynamic variable and Rubisco is abundant. Plain Michaelis–Menten overestimates the rate at low RuBP.

**Mass action.** $v_c = k\,[\mathrm{CO_2}]\,[\mathrm{RuBP}]$, with no saturation ([Hahn 1987](https://doi.org/10.1093/oxfordjournals.aob.a087432)). This is reasonable only far below saturation, and it makes the model's capacity unbounded.

## Oxygenation

**None.** Pettersson-type CBB models simulate isolated chloroplasts under non-photorespiratory conditions and leave oxygenation out. This is fine for CBB-cycle dynamics, but wrong for leaf gas exchange in air.

**O₂ competitive term.** O₂ appears as a competitive inhibitor of carboxylation, $K_c(1 + O/K_o)$, without its own flux. It reduces carboxylation but by itself does not release CO₂.

**Γ\* CO₂ loss.** The FvCB approach: oxygenation is expressed through the ratio $\phi = v_o/v_c = 2\Gamma^\ast/C$. Half a CO₂ is released per oxygenation, so

$$
A = v_c - 0.5\, v_o - R_d = v_c \left(1 - \frac{\Gamma^\ast}{C}\right) - R_d
$$

$\Gamma^\ast$ is the CO₂ compensation point in the absence of day respiration. _Pitfall:_ $\Gamma^\ast$ depends on the CO₂ basis. A $\Gamma^\ast$ measured on a $C_i$ basis is not the same parameter as one on a $C_c$ basis.

**From Sc/o.** $\Gamma^\ast$ or $v_o$ is derived from the specificity factor $S_{c/o} = (k_{cat,c}/K_c)/(k_{cat,o}/K_o)$, giving $\Gamma^\ast = 0.5\, O / S_{c/o}$ ([Harley 1992](https://doi.org/10.1111/j.1365-3040.1992.tb00974.x), [Johnson 2021](https://doi.org/10.1007/s11120-021-00840-4)). The advantage is that it ties oxygenation to measurable enzyme properties.

**Explicit vo flux.** A separate oxygenation reaction that produces phosphoglycolate, which can then feed an explicit photorespiratory pathway ([Hahn 1987](https://doi.org/10.1093/oxfordjournals.aob.a087432), [Bellasio 2019](https://doi.org/10.1007/s11120-018-0601-1), [Pfennig 2024](https://doi.org/10.1371/journal.pcbi.1012445)). Needed if photorespiratory metabolites, N re-assimilation or glycine/serine export matter. [Yokota 1985](/models/yokota1985) models the downstream pathway.

## Effector inhibition

**None.** All FvCB-family models.

**PGA, FBP, SBP, Pi, NADPH.** The five competitive inhibitors on the RuBP site from [Pettersson & Ryde-Pettersson 1988](https://doi.org/10.1111/j.1432-1033.1988.tb14242.x), inherited by every model in that lineage ([Poolman 2000](https://doi.org/10.1093/jexbot/51.suppl_1.319), [Matuszyńska 2019](https://doi.org/10.1111/ppl.12962), [Saadat 2021](https://doi.org/10.3389/fpls.2021.750580)). They stabilise the CBB cycle by slowing RuBP consumption when sugar phosphates accumulate.

**Other competitive set.** For example, ADP, NADP⁺, PGA and Pi in [Bellasio 2019](https://doi.org/10.1007/s11120-018-0601-1).

**PGA raises Km(RuBP).** An apparent $K_m$ that includes PGA competition only, $K_{m,app} = K_{m,\mathrm{RuBP}}(1 + [\mathrm{PGA}]/K_{i,\mathrm{PGA}})$, combined with tight binding ([Morales 2018](https://doi.org/10.1111/pce.13119)).

_Pitfall:_ the inhibition constants in all of these come from in-vitro assays. Tight-binding inhibitors such as CA1P and XuBP, which Rubisco activase removes, are not covered by any of them.

## Activation and activase

**Constant.** All sites active (or a fixed fraction folded into $V_{c,\max}$). This is the default for steady-state models, and acceptable as long as light is constant.

**Light / redox / pH driven.** The active fraction follows the light reactions through reduced ferredoxin or thioredoxin ([Saadat 2021](https://doi.org/10.3389/fpls.2021.750580), [Pfennig 2024](https://doi.org/10.1371/journal.pcbi.1012445)) or stromal pH ([Salvatori 2022](https://doi.org/10.3389/fpls.2021.787877)). Mechanistically this is closer to the redox regulation of FBPase, SBPase and PRK than to Rubisco activation itself. Saadat 2021 applies one shared thioredoxin-activated fraction to all of these enzymes.

**First-order relaxation.** The activation state relaxes towards a light- and CO₂-dependent steady state with different time constants for activation and deactivation ([Bellasio 2019](https://doi.org/10.1007/s11120-018-0601-1)):

$$
\frac{dR_\mathrm{act}}{dt} = \frac{R_\mathrm{act,eq}(I, C) - R_\mathrm{act}}{\tau_{i/d}}
$$

This is phenomenological, but it captures the 2–10 min induction of photosynthesis after a light step.

**Explicit activase.** The rate of activation is proportional to the Rubisco activase concentration, with a temperature-sensitive activase activity limiting the maximum activation state ([Mott & Woodrow 2000](https://doi.org/10.1093/jexbot/51.suppl_1.399), [Morales 2018](https://doi.org/10.1111/pce.13119), [Zhu 2013](https://doi.org/10.1111/pce.12025)). Choose this when the question involves activase (heat stress, activase mutants, light flecks).

**Carbamylation (CO₂, Mg²⁺).** The active site must bind an activator CO₂ (distinct from the substrate CO₂) and Mg²⁺ before it is catalytically competent. The equilibrium makes activation CO₂- and pH-dependent ([Farquhar 1979](<https://doi.org/10.1016/0003-9861(79)90052-3>)).

## CO₂ at the active site

**Ci (infinite gm).** Classic FvCB parameterisations use intercellular CO₂ directly, which assumes an infinite mesophyll conductance. _Pitfall:_ $K_c$, $K_o$ and $\Gamma^\ast$ fitted on a $C_i$ basis are apparent constants. Do not combine them with a finite $g_m$.

**Cc (finite gm).** The chloroplastic CO₂ partial pressure, $C_c = C_i - A/g_m$ ([Morales 2018](https://doi.org/10.1111/pce.13119); see the [FvCB family](/mechanisms/fvcb-family#finite-mesophyll-conductance) page for the gm branch).

**Dissolved stromal CO₂.** A concentration (mM) rather than a partial pressure. This is common in metabolic models, where it is either a constant ([Poolman 2000](https://doi.org/10.1093/jexbot/51.suppl_1.319)) or a dynamic variable with dissolution and carbonic anhydrase ([Bellasio 2019](https://doi.org/10.1007/s11120-018-0601-1)). Convert with Henry's law. The temperature dependence of solubility is easy to forget.

**Constant / in Vmax.** CO₂ does not appear in the rate law at all ([Zhu 2009](https://doi.org/10.1016/j.nonrwa.2008.01.021), lumped CBB fluxes).

## Temperature

**Arrhenius.** $k(T) = k_{25}\, \exp\!\left[\frac{\Delta H_a (T - 298.15)}{298.15\, R\, T}\right]$ for $V_{c,\max}$, $K_c$, $K_o$ and $\Gamma^\ast$ ([Bernacchi 2001](https://doi.org/10.1111/j.1365-3040.2001.00668.x)). Valid up to roughly the thermal optimum.

**Peaked Arrhenius.** Adds a deactivation term above an optimum, $\left[1 + \exp\!\left(\frac{\Delta S\, T - \Delta H_d}{R T}\right)\right]^{-1}$ ([Harley 1992](https://doi.org/10.1111/j.1365-3040.1992.tb00974.x), [Medlyn 2002](https://doi.org/10.1046/j.1365-3040.2002.00891.x)). In vivo, the decline of $V_{c,\max}$ at high temperature is at least partly caused by activase failure. [Morales 2018](https://doi.org/10.1111/pce.13119) applies the peaked function to activase rather than to Rubisco.

## Equation catalogue

The rate laws as implemented, in each paper's own notation.

### Farquhar, von Caemmerer & Berry 1980

$$
W_c = \frac{V_{c,\max}\, C_i}{C_i + K_c (1 + O/K_o)}, \qquad A = \min(W_c, W_j, W_p)\left(1 - \frac{\Gamma^\ast}{C_i}\right) - R_d
$$

Harley 1992, Bernacchi 2001, Bernacchi 2013 and Johnson 2021 share this form and differ in the temperature functions and in how $\Gamma^\ast$ is obtained ($\Gamma^\ast = 0.5\,O/\tau$ in Harley 1992, $\Gamma^\ast = O/(2 S)$ with $S$ from $k_{cat}$ and $K_m$ values in Johnson 2021).

### Hahn 1987

$$
v_c = k_1\, [\mathrm{CO_2}]\, [\mathrm{RuBP}], \qquad v_o = k_{16}\, [\mathrm{O_2}]\, [\mathrm{RuBP}]
$$

### Pettersson & Ryde-Pettersson 1988, Poolman 2000, Matuszyńska 2019, Saadat 2021, Lam 2026

$$
v_c = \frac{V_{\max}\, [\mathrm{CO_2}]\, [\mathrm{RuBP}]}{\left([\mathrm{CO_2}] + K_{m,\mathrm{CO_2}}\right)\left([\mathrm{RuBP}] + K_{m,\mathrm{RuBP}}\left(1 + \frac{[\mathrm{PGA}]}{K_{i,\mathrm{PGA}}} + \frac{[\mathrm{FBP}]}{K_{i,\mathrm{FBP}}} + \frac{[\mathrm{SBP}]}{K_{i,\mathrm{SBP}}} + \frac{[\mathrm{P_i}]}{K_{i,\mathrm{P_i}}} + \frac{[\mathrm{NADPH}]}{K_{i,\mathrm{NADPH}}}\right)\right)}
$$

with $V_{\max} = k_{cat} E_0$. In Saadat 2021, $E_0$ is multiplied by the thioredoxin-activated fraction $E_\mathrm{active}$.

### Zhu 2009

$$
v_1 = \frac{V_{1,\max}\, [\mathrm{RuBP}]}{K_{m1} + [\mathrm{RuBP}]}
$$

### Morales 2018

$$
V_c = \frac{k_{cat}\, R_B\, f_{RB}\, f_\mathrm{RuBP}\, C_c}{C_c + K_{mc}(1 + O/K_{mo})}, \qquad
\frac{df_{RB}}{dt} = \begin{cases} K_{rca}\, \mathrm{RCA}\, f_\mathrm{RCA}(T)\, (f_{RB,ss} - f_{RB}) & f_{RB} < f_{RB,ss} \\ K_{d,RB}\, (f_{RB,ss} - f_{RB}) & \text{else} \end{cases}
$$

$f_\mathrm{RuBP}$ is the tight-binding fraction with $K_{m,app} = K_{m,\mathrm{RuBP}}(1 + [\mathrm{PGA}]/K_{i,\mathrm{PGA}})$.

### Bellasio 2019

$$
v_c = \frac{V_{\max}\, R_\mathrm{act}\, f_\mathrm{RuBP}\, [\mathrm{CO_2}]\, [\mathrm{RuBP}]}{\left([\mathrm{CO_2}] + K_c(1 + [\mathrm{O_2}]/K_o)\right)\left([\mathrm{RuBP}] + K_{m,\mathrm{RuBP}}^{app}\right)}, \qquad
v_o = \frac{K_{h,\mathrm{O_2}}\, [\mathrm{O_2}]}{K_{h,\mathrm{CO_2}}\, [\mathrm{CO_2}]\, S_{c/o}}\, v_c
$$

$K_{m,\mathrm{RuBP}}^{app}$ includes competitive inhibition by ADP, NADP⁺, PGA and Pi.

### Li 2021

$$
v_\mathrm{CBB} \propto k_\mathrm{CBB}(I)\left(1 - e^{-t/600}\right)\left(\ln\frac{[\mathrm{NADPH}]}{[\mathrm{NADP^+}]} - \ln 1.25\right), \qquad k_\mathrm{CBB} = \frac{60\, I}{250 + I}
$$

### Salvatori 2022

$$
A = v_C\, R\, [\mathrm{NADPH}], \qquad \frac{dR}{dt} = v_R (1 - R)\min(d, \mathrm{pH})
$$

### Pfennig 2024

$$
f_\mathrm{energy} = \frac{[\mathrm{ATP}][\mathrm{NADPH}]}{([\mathrm{ATP}] + K_\mathrm{ATP})([\mathrm{NADPH}] + K_\mathrm{NADPH})}, \qquad
v_\mathrm{CBB} = v_{\max}\, \mathrm{CBB_a}\, f_\mathrm{energy} \frac{[\mathrm{CO_2}]}{[\mathrm{CO_2}] + K_\mathrm{CO_2}(1 + [\mathrm{O_2}]/K_{I,\mathrm{O_2}})}
$$

$$
v_\mathrm{oxy} = v_{o,\max}\, \mathrm{CBB_a}\, f_\mathrm{energy} \frac{[\mathrm{PGA}]}{[\mathrm{PGA}] + K_\mathrm{PGA}} \frac{[\mathrm{O_2}]}{[\mathrm{O_2}] + K_\mathrm{O_2}(1 + [\mathrm{CO_2}]/K_{I,\mathrm{CO_2}})}, \qquad
\frac{d\,\mathrm{CBB_a}}{dt} = k\left(\frac{[\mathrm{Fd_{red}}]}{[\mathrm{Fd_{red}}] + K_\mathrm{Fd}} - \mathrm{CBB_a}\right)
$$
