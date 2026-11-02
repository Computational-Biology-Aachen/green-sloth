/**
 * Eigenvalues of a real square matrix: reduction to Hessenberg form, then the
 * shifted QR algorithm, as JAMA's `EigenvalueDecomposition` (public domain),
 * without the eigenvectors.
 */

export interface Eigenvalues {
  real: number[];
  imag: number[];
}

/** Orthogonal reduction to upper Hessenberg form, in place. */
function toHessenberg(H: number[][]): void {
  const n = H.length;
  const ort = new Array<number>(n).fill(0);
  for (let m = 1; m < n - 1; m++) {
    let scale = 0;
    for (let i = m; i < n; i++) scale += Math.abs(H[i][m - 1]);
    if (scale === 0) continue;
    let h = 0;
    for (let i = n - 1; i >= m; i--) {
      ort[i] = H[i][m - 1] / scale;
      h += ort[i] * ort[i];
    }
    let g = Math.sqrt(h);
    if (ort[m] > 0) g = -g;
    h -= ort[m] * g;
    ort[m] -= g;
    for (let j = m; j < n; j++) {
      let f = 0;
      for (let i = n - 1; i >= m; i--) f += ort[i] * H[i][j];
      f /= h;
      for (let i = m; i < n; i++) H[i][j] -= f * ort[i];
    }
    for (let i = 0; i < n; i++) {
      let f = 0;
      for (let j = n - 1; j >= m; j--) f += ort[j] * H[i][j];
      f /= h;
      for (let j = m; j < n; j++) H[i][j] -= f * ort[j];
    }
    ort[m] *= scale;
    H[m][m - 1] = scale * g;
  }
}

/** Eigenvalues of an upper Hessenberg matrix by the shifted QR algorithm. */
function hessenbergEigenvalues(H: number[][]): Eigenvalues {
  const nn = H.length;
  const d = new Array<number>(nn).fill(0);
  const e = new Array<number>(nn).fill(0);
  let n = nn - 1;
  const low = 0;
  const eps = 2 ** -52;
  let exshift = 0;
  let p = 0;
  let q = 0;
  let r = 0;
  let s: number;
  let z: number;
  let w: number;
  let x: number;
  let y: number;

  let norm = 0;
  for (let i = 0; i < nn; i++) {
    for (let j = Math.max(i - 1, 0); j < nn; j++) norm += Math.abs(H[i][j]);
  }

  let iter = 0;
  while (n >= low) {
    // Look for a single small sub-diagonal element.
    let l = n;
    while (l > low) {
      s = Math.abs(H[l - 1][l - 1]) + Math.abs(H[l][l]);
      if (s === 0) s = norm;
      if (Math.abs(H[l][l - 1]) < eps * s) break;
      l--;
    }

    if (l === n) {
      // One root found.
      H[n][n] += exshift;
      d[n] = H[n][n];
      e[n] = 0;
      n--;
      iter = 0;
    } else if (l === n - 1) {
      // Two roots found.
      w = H[n][n - 1] * H[n - 1][n];
      p = (H[n - 1][n - 1] - H[n][n]) / 2;
      q = p * p + w;
      z = Math.sqrt(Math.abs(q));
      H[n][n] += exshift;
      H[n - 1][n - 1] += exshift;
      x = H[n][n];
      if (q >= 0) {
        z = p >= 0 ? p + z : p - z;
        d[n - 1] = x + z;
        d[n] = z !== 0 ? x - w / z : d[n - 1];
        e[n - 1] = 0;
        e[n] = 0;
      } else {
        d[n - 1] = x + p;
        d[n] = x + p;
        e[n - 1] = z;
        e[n] = -z;
      }
      n -= 2;
      iter = 0;
    } else {
      // No convergence yet.
      x = H[n][n];
      y = 0;
      w = 0;
      if (l < n) {
        y = H[n - 1][n - 1];
        w = H[n][n - 1] * H[n - 1][n];
      }
      // Wilkinson's original ad hoc shift.
      if (iter === 10) {
        exshift += x;
        for (let i = low; i <= n; i++) H[i][i] -= x;
        s = Math.abs(H[n][n - 1]) + Math.abs(H[n - 1][n - 2]);
        x = y = 0.75 * s;
        w = -0.4375 * s * s;
      }
      // MATLAB's new ad hoc shift.
      if (iter === 30) {
        s = (y - x) / 2;
        s = s * s + w;
        if (s > 0) {
          s = Math.sqrt(s);
          if (y < x) s = -s;
          s = x - w / ((y - x) / 2 + s);
          for (let i = low; i <= n; i++) H[i][i] -= s;
          exshift += s;
          x = y = w = 0.964;
        }
      }
      iter++;
      if (iter > 1000 * nn) throw new Error("Eigenvalues did not converge");

      // Look for two consecutive small sub-diagonal elements.
      let m = n - 2;
      while (m >= l) {
        z = H[m][m];
        r = x - z;
        s = y - z;
        p = (r * s - w) / H[m + 1][m] + H[m][m + 1];
        q = H[m + 1][m + 1] - z - r - s;
        r = H[m + 2][m + 1];
        s = Math.abs(p) + Math.abs(q) + Math.abs(r);
        p /= s;
        q /= s;
        r /= s;
        if (m === l) break;
        if (
          Math.abs(H[m][m - 1]) * (Math.abs(q) + Math.abs(r)) <
          eps *
            (Math.abs(p) *
              (Math.abs(H[m - 1][m - 1]) +
                Math.abs(z) +
                Math.abs(H[m + 1][m + 1])))
        ) {
          break;
        }
        m--;
      }
      for (let i = m + 2; i <= n; i++) {
        H[i][i - 2] = 0;
        if (i > m + 2) H[i][i - 3] = 0;
      }

      // Double QR step involving rows l:n and columns m:n.
      for (let k = m; k <= n - 1; k++) {
        const notlast = k !== n - 1;
        if (k !== m) {
          p = H[k][k - 1];
          q = H[k + 1][k - 1];
          r = notlast ? H[k + 2][k - 1] : 0;
          x = Math.abs(p) + Math.abs(q) + Math.abs(r);
          if (x === 0) continue;
          p /= x;
          q /= x;
          r /= x;
        }
        s = Math.sqrt(p * p + q * q + r * r);
        if (p < 0) s = -s;
        if (s !== 0) {
          if (k !== m) {
            H[k][k - 1] = -s * x;
          } else if (l !== m) {
            H[k][k - 1] = -H[k][k - 1];
          }
          p += s;
          x = p / s;
          y = q / s;
          z = r / s;
          q /= p;
          r /= p;
          // Row modification.
          for (let j = k; j < nn; j++) {
            p = H[k][j] + q * H[k + 1][j];
            if (notlast) {
              p += r * H[k + 2][j];
              H[k + 2][j] -= p * z;
            }
            H[k][j] -= p * x;
            H[k + 1][j] -= p * y;
          }
          // Column modification.
          for (let i = 0; i <= Math.min(n, k + 3); i++) {
            p = x * H[i][k] + y * H[i][k + 1];
            if (notlast) {
              p += z * H[i][k + 2];
              H[i][k + 2] -= p * r;
            }
            H[i][k] -= p;
            H[i][k + 1] -= p * q;
          }
        }
      }
    }
  }
  return { real: d, imag: e };
}

/** Eigenvalues sorted by real part, then imaginary part, as numpy's `sort_complex`. */
export function eigenvalues(matrix: number[][]): Eigenvalues {
  const H = matrix.map((row) => [...row]);
  if (H.length === 0) return { real: [], imag: [] };
  toHessenberg(H);
  const { real, imag } = hessenbergEigenvalues(H);
  const order = real
    .map((_, i) => i)
    .sort((a, b) => real[a] - real[b] || imag[a] - imag[b]);
  return { real: order.map((i) => real[i]), imag: order.map((i) => imag[i]) };
}
