All five figures are reproduced. Figs 1 and 2 are model fits to measured A–Ci curves of cotton and soybean (the measured points aren't tabulated, so only the model lines are drawn), and Figs 3–5 are simulations. Each was checked by overlaying the model on a 400 dpi scan of the paper. All curves lie on the printed lines within the line width, including the transition points.

**Closed form.** The paper solves Eqns 1 and 6 iteratively because $W_p$ depends on $v_o$. But $v_o = \Phi\, v_c$ with $\Phi = O/(\tau C)$, which depends only on C and O, so $v_c = 3T + 2(1 - f_{gly})\,\Phi\, v_c$ is linear in $v_c$: $W_p = 3T / (1 - 2(1 - f_{gly})\Phi)$. This matches `brentq` on the implicit equation to machine precision. $f_{gly}$ is the fraction of the C lost as glycolate that returns as glycerate: 3/4 gives Eqn 5 ($W_p = 3T + 0.5 v_o$), 0 gives Eqn 6 ($3T + 2 v_o$) and 1/2 gives Eqn 6b ($3T + v_o$). Where the denominator is ≤ 0 (C ≤ 4(1 − $f_{gly}$)Γ*), Pi can't limit, and $W_p$ is set very large. In the notation of Sharkey et al. (2007), $f_{gly} = 3(1 - \alpha)/4$.

**Unprinted parameters.** The paper prints only $V_{cmax}$, R, T and (for cotton) $R_d$.

- **Kc, Ko, τ:** the Arrhenius fits of Harley et al. (1992, Table 1), which come from the same group's cotton grown at the Duke phytotron, as here. At 25 °C they give Kc = 274 µbar, Ko = 418 mbar and τ = 2326 (Γ* = 43.0 µbar at 200 mbar O₂). With them, the Rubisco-limited branches and the 20 mbar curves of all panels fall on the printed lines, so no fitting was needed.
- **Light response:** with R used directly as $W_j = R/(1 + \Phi)$, the ambient-O₂ RuBP-limited branches of every panel in Figs 1 and 2 are clearly too high. The printed R is the light-saturated rate: Fig 1B labels it "Pml", the symbol of Harley et al. (1985) for the potential light-saturated rate. The model therefore uses the light response of Harley et al. (1992, Eqn 7), $J = \alpha I/\sqrt{1 + (\alpha I/J_{max})^2}$ with $J_{max} = 4R$, $W_j = J/(4(1+\Phi))$, α = 0.24 and I = 1500 µmol m⁻² s⁻¹ (the cotton measurement PFD, and the PFD of Figs 3 and 4). With this, all six panels match without fitting. A free chamfer fit of the effective R to the scans gives 49.0 for Fig 1A at 200 mbar (the model gives 48.5) and 43.4 for Fig 2C at 180 mbar (the model gives 43.4).
- **Soybean Rd:** not printed. Fig 2A's TPU plateau sits at 3T − Rd = 30.0 (measured from the scan: 30.1), so Rd = 0. The Fig 2 and Figs 3–5 curves match with Rd = 0 throughout.

**Figs 3–5 use R = 56.7, not Fig 2C's 49.6.** The captions say the simulations are "based on parameterization in Fig. 2C", but with R = 49.6 their RuBP-limited branches come out about 10 % low. For example, Fig 5's T = 12 curve reaches 35 instead of 38 at 550 µbar, and Fig 3's arrows move to lower Ci. Fitting the effective RuBP regeneration rate per curve gives R(1500) ≈ 48.0 and R(1200, 900, 600) ≈ 44.6, 37.7 and 29.5–30.6 from Fig 3. With α = 0.24, these are exactly the light response for $R_{max}$ = 56.7, the value printed for cotton in Figs 1B and 1C (a free fit of α and $R_{max}$ gives 0.225 and 58.5). Everything else is the soybean Fig 2C set (Vcmax = 120.9, T = 9.62, Rd = 0, $f_{gly}$ = 1/2). With R = 56.7 all eleven curves of Figs 3–5 lie on the printed ones, including the TPU transitions marked by Fig 3's arrows (model: 363, 423 and 599 µbar; arrows at about 350, 450 and 600, drawn at data symbols). PFD 600 never becomes TPU-limited below 800 µbar, as the caption says. The validations use R = 56.7 for Figs 3–5.

**Text values.**

- Cotton, Fig 1A: TPU-limited from 193 µbar at 20 mbar (text: "≈200") and from 580 µbar at 200 mbar ("greater than 500").
- Soybean, Fig 2A: TPU-limited from 299 µbar at 180 mbar (text: "300 µbar").
- Cotton, Fig 1C: the 20 and 200 mbar curves cross at 589 µbar (text: "approx. 600").
- Soybean, Fig 2C: at 180 mbar, A peaks at 384 µbar (text: "≈375"); at 20 mbar Pi limits from 101 µbar (text: "approx. 100").
- Two text values don't match, though their figures do:
  - Soybean, Fig 2A at 20 mbar: TPU-limited from 101 µbar, as the figure's kink shows; the text says "approx. 150".
  - Cotton, Fig 1C at 200 mbar: Pi limits from 791 µbar; the text says "only at Ci > 950". That is beyond the plotted range, and the plotted curve matches.

**Presentation.** The paper tells the 20 mbar and ambient O₂ curves of Figs 1 and 2 apart by their measured symbols (open and closed). Here they are solid and dashed, with a legend. The symbols of Figs 3–5 are drawn every 50 µbar on a 10 µbar grid, from 50 µbar. The paper also has symbols at 75, 125 and 175 µbar in Figs 3 and 4.

**Not built in.** The Discussion's variant, in which two glycines leave the photorespiratory pathway per serine produced, is described as changing the model "only very slightly", and it has no figure.
