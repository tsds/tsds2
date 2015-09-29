import java.awt.GraphicsEnvironment;

	public class ListFonts {
		public static void main(String args[]) {
			GraphicsEnvironment e = GraphicsEnvironment.getLocalGraphicsEnvironment();
			System.out.print("[");
			int nf = e.getAvailableFontFamilyNames().length;
			int f = 1;
			for (String font:e.getAvailableFontFamilyNames()) {
				if (f == nf) {
					System.out.print("\"" + font + "\"");
				} else {
					System.out.print("\"" + font + "\",");
				}
				f = f+1;
			}
			System.out.println("]");
		}
	}