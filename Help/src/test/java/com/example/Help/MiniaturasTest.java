package com.example.Help;

import com.example.Help.util.Miniaturas;
import org.junit.jupiter.api.Test;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Random;
import static org.assertj.core.api.Assertions.assertThat;

class MiniaturasTest {
    @Test void reduzAvatarSemAlterarOriginal() throws Exception {
        BufferedImage original = new BufferedImage(800, 600, BufferedImage.TYPE_INT_RGB);
        Random random = new Random(42);
        for (int y=0; y<600; y++) for (int x=0; x<800; x++) original.setRGB(x,y,random.nextInt(0x1000000));
        ByteArrayOutputStream bytes = new ByteArrayOutputStream(); ImageIO.write(original,"png",bytes);
        String entrada="data:image/png;base64,"+Base64.getEncoder().encodeToString(bytes.toByteArray());
        String saida=Miniaturas.avatar(entrada);
        assertThat(saida.length()).isLessThan(entrada.length());
        BufferedImage lida=ImageIO.read(new ByteArrayInputStream(Base64.getDecoder().decode(saida.substring(saida.indexOf(',')+1))));
        assertThat(Math.max(lida.getWidth(),lida.getHeight())).isEqualTo(256);
    }
    @Test void preservaUrlsEValoresInvalidos() {
        assertThat(Miniaturas.avatar("https://exemplo.invalid/foto.png")).isEqualTo("https://exemplo.invalid/foto.png");
        assertThat(Miniaturas.avatar(null)).isNull();
    }
}
